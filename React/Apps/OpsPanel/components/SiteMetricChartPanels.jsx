import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import SiteBrowserWiseTraffic from './MetricCharts/SiteBrowserWiseTraffic';
import SiteModeWiseTraffic from './MetricCharts/SiteModeWiseTraffic';
import SiteTop20Countries from './MetricCharts/SiteTop20Countries';
import SiteMetrics from './MetricCharts/SiteMetrics';

const SiteMetricChartPanels = props => {
	return (
            <div className="pd-20">
                <SiteBrowserWiseTraffic />
                <SiteModeWiseTraffic />
                <SiteTop20Countries />
                <SiteMetrics />
            </div>
	);
};

export default SiteMetricChartPanels;
