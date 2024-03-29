import React from 'react';
import PropTypes from 'prop-types';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import LegendItem from './LegendItem';

const ChartLegend = ({ chart: { series }, legends, activeLegendItems }) => (
	<div className="text-center chart-legend u-margin-v3">
		{series.map((serie, key) => (
			<LegendItem
				key={key}
				serie={serie}
				legend={legends[serie.name]}
				activeLegendItems={activeLegendItems}
			/>
		))}
	</div>
);

ChartLegend.propTypes = {
	chart: PropTypes.shape({ series: PropTypes.arrayOf(PropTypes.object).isRequired }).isRequired,
	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ChartLegend;
