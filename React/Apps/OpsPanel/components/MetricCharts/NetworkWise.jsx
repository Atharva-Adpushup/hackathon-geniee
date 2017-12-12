import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

const FooterTitle = (
    <h4>Network Wise Performance Chart</h4>
);

const NetworkWise = props => {
    return (
        <Panel className="mb-20 metricsChart" header={FooterTitle}>
        Metrics Chart will come here
        </Panel>
    )
};

export default NetworkWise;