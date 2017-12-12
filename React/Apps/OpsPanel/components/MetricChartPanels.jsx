import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';

const title = (
    <h3>Global Site Vitals</h3>
);

const MetricChartPanels = props => {
	return (
        <ActionCard title={title}>
        </ActionCard>
	);
};

export default MetricChartPanels;
