import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import LegendItem from './LegendItem';

const ChartLegend = ({ chart: { series }, activeLegendItems }) => (
	<div className="container">
		<Row className="text-center chart-legend u-margin-v3">
			{series.map((serie, key) => (
				<LegendItem key={key} serie={serie} activeLegendItems={activeLegendItems} />
			))}
		</Row>
	</div>
);

ChartLegend.propTypes = {
	chart: PropTypes.shape({ series: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired,
	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ChartLegend;
