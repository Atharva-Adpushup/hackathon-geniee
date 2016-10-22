import React, { PropTypes } from 'react';
import _ from 'lodash';
// import CustomSizeForm from './customSizeForm.jsx';
import { Accordion, Row, Col, Panel } from 'react-bootstrap';


class AdSizeSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: props.activeTab || 0
		};
		this.onChecked = this.onChecked.bind(this);
		this.handleTabClick = this.handleTabClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.activeTab) {
			this.setState({ activeTab: nextProps.activeTab });
		}
	}


	onChecked(adProps) {
		this.props.onCheckedItem(adProps);
	}

	handleTabClick(key) {
		this.setState({ activeTab: key });
	}

	render() {
		return (
			<Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
				{_.map(this.props.adSizes, (rec, index) => (
					<Panel key={`panel-${index}`} header={`${rec.layoutType} Ads`} eventKey={index}>
						<Row>
							{_.map(rec.sizes, (adProps, innerIndex) => (
								<Col key={`col-${this.props.insertOption}-${innerIndex}`} xs={6} className="Col">
									<input id={this.props.insertOption + rec.layoutType + innerIndex}
										type="radio"
										checked={(this.props.checked === adProps) ? 'checked' : null}
										onClick={this.props.onCheckedItem.bind(null, adProps)}
         />
									<label htmlFor={this.props.insertOption + rec.layoutType + innerIndex}>{`${adProps.width} X ${adProps.height}`}</label>
								</Col>
									))
								}
						</Row>
						{rec.layoutType === 'CUSTOM' ? null /* (<CustomSizeForm updateMenu={self.props.onUpdate} flux={self.props.flux}/>)*/ : null}
					</Panel>
						)
				)}
			</Accordion>
		);
	}
}

AdSizeSelector.propTypes = {
	activeTab: PropTypes.number,
	checked: PropTypes.object,
	onCheckedItem: PropTypes.func,
	adSizes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
};

AdSizeSelector.defaultProps = {
	activeTab: 0
};

export default AdSizeSelector;
