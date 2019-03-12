import React from 'react';
import PropTypes from 'prop-types';
import ReactHighcharts from 'react-highcharts';
import ReactDOM from 'react-dom';
import { getCustomChartConfig } from '../../Services/customChartService';
import ChartLegend from './ChartLegend';

const CustomChart = ({ title, type, config, yAxisGroups, activeLegendItems, containerClass }) => {
	if (type === 'line') {
		const chartConfig = getCustomChartConfig(title, type, config, yAxisGroups, activeLegendItems);

		if (chartConfig.yAxis && chartConfig.yAxis.length) {
			chartConfig.chart = {
				...chartConfig.chart,
				events: {
					load: event => {
						const chart = event.target;

						const node = document.getElementById('chart-legend');
						ReactDOM.render(
							<ChartLegend chart={chart} activeLegendItems={activeLegendItems} />,
							node
						);
					}
				}
			};

			return (
				<div className={containerClass}>
					<div id="chart-legend" />
					<ReactHighcharts config={chartConfig} />
				</div>
			);
		}
	}

	if (type === 'pie') {
		const chartConfig = getCustomChartConfig(title, type, config);

		if (chartConfig.series && chartConfig.series.length) {
			chartConfig.chart = {
				...chartConfig.chart,
				events: {
					load: event => {
						const chart = event.target;

						const node = document.getElementById('chart-legend');
						ReactDOM.render(null, node);
					}
				}
			};

			return (
				<div className={containerClass}>
					<div id="chart-legend" />
					<ReactHighcharts config={chartConfig} />
				</div>
			);
		}
	}

	return (
		<div
			className={`aligner aligner--vCenter aligner--hCenter${
				containerClass ? ` ${containerClass}` : ''
			}`}
		>
			<div className="error">No Data Found!</div>
		</div>
	);
};

CustomChart.propTypes = {
	title: PropTypes.string,
	type: PropTypes.oneOf(['line', 'pie']),
	config: PropTypes.object.isRequired,
	yAxisGroups: PropTypes.arrayOf(
		PropTypes.shape({
			seriesNames: PropTypes.arrayOf(PropTypes.string).isRequired,
			yAxisConfig: PropTypes.object
		})
	),
	activeLegendItems: PropTypes.arrayOf(PropTypes.string),
	containerClass: PropTypes.string
};

CustomChart.defaultProps = {
	title: 'Custom Chart',
	type: 'line',
	yAxisGroups: [],
	activeLegendItems: [],
	containerClass: ''
};

export default CustomChart;
