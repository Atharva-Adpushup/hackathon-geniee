import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';
import Metrics from './MetricCharts/Metrics';
import NetworkWise from './MetricCharts/NetworkWise';

const MetricChartPanels = props => {
	return (
        <ActionCard title='Global Site Vitals'>
            <div className="pd-20">
                <NetworkWise fetchData={props.fetchNetworkWiseData} data={props.charts.networkWise} />
                <Metrics />
            </div>
        </ActionCard>
	);
};

export default MetricChartPanels;
