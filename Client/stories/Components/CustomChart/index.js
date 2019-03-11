import React from 'react';
import PropTypes from 'prop-types';
import ReactHighcharts from 'react-highcharts';
import ReactDOM from 'react-dom';
import { getCustomChartConfig } from '../../Services/customChartService';
import ChartLegend from './ChartLegend';
// import './style.css';

const CustomChart = ({ title, type, config, activeLegendItems, containerClass }) => {
	const chartConfig = getCustomChartConfig(title, type, config);
	chartConfig.chart = {
		events: {
			load: event => {
				console.dir(event);

				const chart = event.target;

				const node = document.getElementById('chart-legend');
				ReactDOM.render(<ChartLegend chart={chart} activeLegendItems={activeLegendItems} />, node);
			}
		}
	};

	return (
		<div className={containerClass}>
			<div id="chart-legend" />
			<ReactHighcharts config={chartConfig} />
		</div>
	);
};

CustomChart.propTypes = {
	title: PropTypes.string,
	type: PropTypes.oneOf(['line', 'pie']),
	config: PropTypes.object.isRequired,
	containerClass: PropTypes.string
};

CustomChart.defaultProps = {
	title: 'Custom Chart',
	type: 'line',
	containerClass: ''
};

export default CustomChart;
