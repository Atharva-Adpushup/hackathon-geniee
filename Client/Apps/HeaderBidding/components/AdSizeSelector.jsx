/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Nav, NavItem } from 'react-bootstrap';

class AdSizeSelector extends React.Component {
	state = {
		activeKey: ''
	};

	componentDidMount() {
		const { filteredAdSizes } = this.props;
		this.setState({ activeKey: Object.keys(filteredAdSizes)[0] });
	}

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
		const { activeKey } = this.state;
		return (
			<Row className="clearfix">
				<Col sm={4}>
					<Nav bsStyle="pills" stacked activeKey={activeKey} onSelect={this.handleNavSelect}>
						{this.renderTabs()}
					</Nav>
				</Col>
				<Col sm={8}>{this.renderTabContent()}</Col>
			</Row>
		);
	}
}

AdSizeSelector.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types
	filteredAdSizes: PropTypes.object.isRequired
};

AdSizeSelector.defaultProps = {};

export default AdSizeSelector;
