import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import SiteBrowserWiseTraffic from './MetricCharts/SiteBrowserWiseTraffic';
import SiteModeWiseTraffic from './MetricCharts/SiteModeWiseTraffic';

const SiteMetricChartPanels = props => {
	return (
            <div className="pd-20">
                <SiteBrowserWiseTraffic />
                <SiteModeWiseTraffic />
            </div>
	);
};

export default SiteMetricChartPanels;
