import React, { PropTypes } from 'react';
import _ from 'lodash';
import CustomSizeForm from './customSizeForm.jsx';
import { partners } from '../../../consts/commonConsts';
import { Accordion, Row, Col, Panel } from 'react-bootstrap';

class AdSizeSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: props.activeTab || 0
		};
		this.handleTabClick = this.handleTabClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.activeTab) {
			this.setState({ activeTab: nextProps.activeTab });
		}
	}

	handleTabClick(key) {
		this.setState({ activeTab: key });
	}

	renderSizePanels(rec, index, isShowCustomAdPanel) {
		return (
			<Panel key={`panel-${index}`} header={`${rec.layoutType} Ads`} eventKey={index}>
				<Row>
					{_.map(rec.sizes, (adProps, innerIndex) => (
						<Col key={`col-${this.props.insertOption}-${innerIndex}`} xs={6} className="Col">
							<input
								id={this.props.insertOption + rec.layoutType + innerIndex}
								type="radio"
								checked={this.props.checked === adProps ? 'checked' : null}
								onClick={this.props.onCheckedItem.bind(null, adProps, false)}
							/>
							<label
								htmlFor={this.props.insertOption + rec.layoutType + innerIndex}
							>{`${adProps.width} X ${adProps.height}`}</label>
						</Col>
					))}
				</Row>
				{isShowCustomAdPanel ? (
					<CustomSizeForm customSizes={this.props.customSizes} onSave={this.props.onCheckedItem} />
				) : null}
			</Panel>
		);
	}

	render() {
		const props = this.props,
			showCustomAdCode =
				!props.partner || (props.partner === partners.geniee.name && props.isCustomAdCodeInVariationAds);

		return (
			<Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
				{_.compact(
					_.map(this.props.adSizes, (rec, index) => {
						const isCustomAdSize = !!(rec.layoutType === 'CUSTOM'),
							isShowCustomAdPanel = !!(isCustomAdSize && showCustomAdCode),
							isRenderPanel = !!((isCustomAdSize && isShowCustomAdPanel) || !isCustomAdSize);

						return isRenderPanel ? this.renderSizePanels(rec, index, isShowCustomAdPanel) : false;
					})
				)}
			</Accordion>
		);
	}
}

AdSizeSelector.propTypes = {
	isCustomAdCodeInVariationAds: PropTypes.bool.isRequired,
	activeTab: PropTypes.number,
	checked: PropTypes.object,
	onCheckedItem: PropTypes.func,
	adSizes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
	partner: PropTypes.string
};

AdSizeSelector.defaultProps = {
	activeTab: 0
};

export default AdSizeSelector;
