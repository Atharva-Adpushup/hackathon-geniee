import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

const FooterTitle = (
    <h4>Metrics Performance Chart</h4>
);

const Metrics = props => {
    return (
        <Panel className="mb-20 metricsChart" header={FooterTitle}>
        Metrics Chart will come here
        </Panel>
    )
};

export default Metrics;