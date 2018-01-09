import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import BrowserWiseTraffic from './MetricCharts/BrowserWiseTraffic';

const SiteMetricChartPanels = props => {
	return (
            <div className="pd-20">
                <BrowserWiseTraffic />
            </div>
	);
};

export default SiteMetricChartPanels;
