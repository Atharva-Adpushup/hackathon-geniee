import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard.jsx';
import Metrics from './MetricCharts/Metrics';
import NetworkWise from './MetricCharts/NetworkWise';
import ModeWiseTraffic from './MetricCharts/ModeWiseTraffic';
import Top10Countries from './MetricCharts/Top10Countries';
import Top10Sites from './MetricCharts/Top10Sites';

const MetricChartPanels = props => {
	return (
        <ActionCard title='Global Site Vitals'>
            <div className="pd-20">
                <Metrics fetchData={props.fetchMetricsData} data={props.charts.metrics} />
                <NetworkWise fetchData={props.fetchNetworkWiseData} data={props.charts.networkWise} />
                <Top10Sites fetchData={props.fetchTop10SitesData} data={props.charts.top10Sites} />
                <ModeWiseTraffic fetchData={props.fetchModeWiseTrafficData} data={props.charts.modeWiseTraffic} />
                <Top10Countries fetchData={props.fetchTop10CountriesData} data={props.charts.top10Countries} />
            </div>
        </ActionCard>
	);
};

export default MetricChartPanels;
