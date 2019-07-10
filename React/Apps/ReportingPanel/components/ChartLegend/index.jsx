import React from 'react';
import ReactDOM from 'react-dom';
import LegendItem from './LegendItem.jsx';
import { Row } from 'react-bootstrap';

const ChartLegend = props => {
    const { series } = props.chart,
        { activeLegendItems } = props;

    return (
        <div className="container">
            <Row className="text-center chart-legend">
                {
                    series.map((serie, key) => {
                        return <LegendItem key={key} serie={serie} activeLegendItems={activeLegendItems} />
                    })
                }
            </Row>
        </div>
    )
}

export default ChartLegend;