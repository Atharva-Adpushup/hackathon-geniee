import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import moment from 'moment';

import LinkList from './LinkList.jsx';
import MetricChartPanels from './MetricChartPanels.jsx';

class ModuleWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
		// this.fetchGlobalMetricCharts = this.fetchGlobalMetricCharts.bind(this);
	}

	componentDidMount() {
		this.props.fetchGlobalMetricCharts({
			transform: true,
			fromDate: this.state.startDate,
			toDate: this.state.endDate
		});
	}

	render() {
		return (
			<Row className="ops-panel-links-container">
				<Col className="" xs={3}>
					<LinkList />
				</Col>
				<Col xs={9}>
					<MetricChartPanels />
				</Col>
			</Row>
		);
	}
}

export default ModuleWrapper;
