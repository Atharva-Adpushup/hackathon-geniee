/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem, FormGroup, ControlLabel, HelpBlock } from '@/Client/helpers/react-bootstrap-imports';
import InputBox from '../../../Components/InputBox';
import CustomButton from '../../../Components/CustomButton';

class AdSizeSelector extends React.Component {
	state = {
		activeKey: '',
		customSize: '',
		customSizeError: ''
	};

	componentDidMount() {
		const { filteredAdSizes } = this.props;
		this.setState({ activeKey: Object.keys(filteredAdSizes)[0] });
	}

	setCustomSize = ({ target: { value } }) => {
		this.setState({ customSize: value });
	};

	onAddCustomSize = () => {
		const { customSize } = this.state;
		const { addNewSize } = this.props;

		const regex = /^\d{2,3}x\d{2,3}$/;
		const isValid = regex.test(customSize);

		if (!isValid) return this.setState({ customSizeError: 'Please enter valid ad size' });

		return addNewSize(customSize);
	};

	handleNavSelect = value => {
		this.setState({ activeKey: value });
	};

	renderTabs = () => {
		const { filteredAdSizes } = this.props;
		const tabsJSX = [];

		for (const adSizeCategory in filteredAdSizes) {
			tabsJSX.push(
				<NavItem key={adSizeCategory} eventKey={adSizeCategory}>
					{adSizeCategory}
				</NavItem>
			);
		}

		return tabsJSX;
	};

	renderTabContent = () => {
		const { activeKey } = this.state;
		const { addNewSize } = this.props;

		if (!activeKey) return false;

		const {
			filteredAdSizes: {
				[activeKey]: { sizes: adSizes }
			}
		} = this.props;

		return (
			<ul>
				{adSizes.map(adSize => {
					const adSizeKey =
						adSize.width !== 'responsive' ? `${adSize.width}x${adSize.height}` : 'responsive';
					const adSizeName =
						adSize.width !== 'responsive' ? `${adSize.width} X ${adSize.height}` : 'Responsive';

					return (
						<li key={adSizeKey}>
							<input id={adSizeKey} type="radio" onClick={() => addNewSize(adSizeKey)} />
							<label htmlFor={adSizeKey}>{adSizeName}</label>
						</li>
					);
				})}
			</ul>
		);
	};

	render() {
		const { activeKey, customSize, customSizeError } = this.state;
		return (
			<React.Fragment>
				<Row className="clearfix add-size-wrap">
					<Col sm={4} className="add-size-tabs">
						<Nav bsStyle="pills" stacked activeKey={activeKey} onSelect={this.handleNavSelect}>
							{this.renderTabs()}
						</Nav>
					</Col>
					<Col sm={8} className="add-size-content">
						{this.renderTabContent()}
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<FormGroup controlId="hb-custom-size" className="u-margin-t5">
							<Col componentClass={ControlLabel} sm={3}>
								Custom Size
							</Col>
							<Col sm={6}>
								<InputBox
									type="text"
									name="hb-custom-size"
									classNames="hb-input"
									value={customSize}
									onChange={this.setCustomSize}
									placeholder="WIDTHxHEIGHT e.g. 728x90"
								/>
								{!!customSizeError && (
									<HelpBlock className="u-text-error">{customSizeError}</HelpBlock>
								)}
							</Col>
							<Col sm={2}>
								<CustomButton variant="secondary" onClick={this.onAddCustomSize}>
									Add
								</CustomButton>
							</Col>
						</FormGroup>
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}

AdSizeSelector.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	filteredAdSizes: PropTypes.object.isRequired
};

AdSizeSelector.defaultProps = {};

export default AdSizeSelector;
