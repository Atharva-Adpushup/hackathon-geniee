import React from 'react';
import PropTypes from 'prop-types';
import ReactHighcharts from 'react-highcharts';
import ReactDOM from 'react-dom';
import { getCustomChartConfig } from '../../Services/customChartService';
import ChartLegend from './ChartLegend';

const CustomChart = ({
	title,
	type,
	series,
	categories,
	legends,
	customConfig,
	yAxisGroups,
	activeLegendItems,
	containerClass
}) => {
	if (type === 'line' || type === 'spline') {
		const chartConfig = getCustomChartConfig(
			type,
			series,
			categories,
			customConfig,
			yAxisGroups,
			activeLegendItems
		);

		if (chartConfig.yAxis && chartConfig.yAxis.length) {
			chartConfig.chart = {
				...chartConfig.chart,
				events: {
					load: event => {
						const chart = event.target;

						const node = document.getElementById('chart-legend-wrap');
						ReactDOM.render(
							<ChartLegend chart={chart} legends={legends} activeLegendItems={activeLegendItems} />,
							node
						);
					}
				}
			};

			return (
				<div className={containerClass}>
					{title && <h3 className="text-center">{title}</h3>}
					<div id="chart-legend-wrap" />
					<ReactHighcharts config={chartConfig} />
				</div>
			);
		}
	}

	if (type === 'pie') {
		const chartConfig = getCustomChartConfig(type, series, customConfig);

		if (chartConfig.series && chartConfig.series.length) {
			chartConfig.chart = {
				...chartConfig.chart,
				events: {
					load: event => {
						const node = document.getElementById('chart-legend-wrap');
						ReactDOM.render(null, node);
					}
				}
			};

			return (
				<div className={containerClass}>
					{title && <h3 className="text-center">{title}</h3>}
					<div id="chart-legend-wrap" />
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
	type: PropTypes.oneOf(['line', 'spline', 'pie']),
	series: PropTypes.arrayOf(
		PropTypes.shape({
			data: PropTypes.array,
			name: PropTypes.string,
			description: PropTypes.string,
			total: PropTypes.string
		})
	).isRequired,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired,
	legends: PropTypes.shape({ description: PropTypes.string, total: PropTypes.string }),
	customConfig: PropTypes.object,
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
	title: '',
	type: 'spline',
	legends: {},
	customConfig: {},
	yAxisGroups: [],
	activeLegendItems: [],
	containerClass: ''
};

export default CustomChart;
