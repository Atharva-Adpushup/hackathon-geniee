import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import LegendItem from './LegendItem';

const ChartLegend = ({ chart: { series }, legends, activeLegendItems, onLegendChange }) => (
	<div className="text-center chart-legend u-margin-v3">
		{legends.map((legend, key) => (
			<LegendItem
				key={key}
				legend={legend}
				activeLegendItems={activeLegendItems}
				onLegendChange={onLegendChange}
				series={series}
			/>
		))}
	</div>
);

// ChartLegend.propTypes = {
// 	chart: PropTypes.shape({ series: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired,
// 	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
// };

export default ChartLegend;
