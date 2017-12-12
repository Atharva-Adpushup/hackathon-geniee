import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';

import LinkList from './LinkList.jsx';
import MetricChartPanels from './MetricChartPanels.jsx';

class ModuleWrapper extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}
	render() {
		const props = this.props;

		return (
			<Row className="ops-panel-links-container">
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
