import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem, Button } from 'react-bootstrap';

import LinkList from './LinkList.jsx';
import MetricChartPanels from './MetricChartPanels.jsx';

class ModuleWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isShowLinkList: true
		};
		this.renderOnlyCharts = this.renderOnlyCharts.bind(this);
		this.renderToggleLinksButton = this.renderToggleLinksButton.bind(this);
		this.handleToggleButtonClick = this.handleToggleButtonClick.bind(this);
	}

	componentDidMount() {}

	handleToggleButtonClick() {
		this.setState({
			isShowLinkList: !this.state.isShowLinkList
		});
	}

	renderToggleLinksButton() {
		const computedTextString = this.state.isShowLinkList ? 'Hide' : 'Show',
			finalTextString = `${computedTextString} Useful Links`;

		return (
			<Col xs={12} className="u-margin-b15px u-padding-0px">
				<Button onClick={this.handleToggleButtonClick}>{finalTextString}</Button>
			</Col>
		);
	}

	renderOnlyCharts() {
		const props = this.props;

		return (
			<Row className="ops-panel-links-container">
				{this.renderToggleLinksButton()}
				<Col xs={12}>
					<MetricChartPanels {...props} />
				</Col>
			</Row>
		);
	}

	render() {
		const props = this.props,
			isShowLinkList = this.state.isShowLinkList;
		
		if (!isShowLinkList) {
			return this.renderOnlyCharts();
		}

		return (
			<Row className="ops-panel-links-container">
				{this.renderToggleLinksButton()}
				<Col className="" xs={3}>
					<LinkList />
				</Col>
				<Col xs={9}>
					<MetricChartPanels {...props} />
				</Col>
			</Row>
		);
	}
}

export default ModuleWrapper;
