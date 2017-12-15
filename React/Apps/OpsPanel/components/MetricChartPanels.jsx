import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';
import Metrics from './MetricCharts/Metrics';
import NetworkWise from './MetricCharts/NetworkWise';
import ModeWiseTraffic from './MetricCharts/ModeWiseTraffic';

const MetricChartPanels = props => {
	return (
        <ActionCard title='Global Site Vitals'>
            <div className="pd-20">
                <Metrics fetchData={props.fetchMetricsData} data={props.charts.metrics} />
                <NetworkWise fetchData={props.fetchNetworkWiseData} data={props.charts.networkWise} />
                <ModeWiseTraffic fetchData={props.fetchModeWiseTrafficData} data={props.charts.modeWiseTraffic} />
            </div>
        </ActionCard>
	);
};

export default MetricChartPanels;
