import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';
import Metrics from './MetricCharts/Metrics.jsx';
import NetworkWise from './MetricCharts/NetworkWise.jsx';

const MetricChartPanels = props => {
	return (
        <ActionCard title='Global Site Vitals'>
            <div className="pd-20">
                <NetworkWise />
                <Metrics/>
            </div>
        </ActionCard>
	);
};

export default MetricChartPanels;
