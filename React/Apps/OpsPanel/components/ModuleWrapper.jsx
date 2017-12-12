import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import LinkList from './LinkList.jsx';
import MetricChartPanels from './MetricChartPanels.jsx';

const ModuleWrapper = props => {
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
};

export default ModuleWrapper;
