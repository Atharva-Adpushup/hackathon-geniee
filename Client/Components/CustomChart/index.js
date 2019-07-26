import React from 'react';
import PropTypes from 'prop-types';
import ReactHighcharts from 'react-highcharts';
import ReactDOM from 'react-dom';
import { getCustomChartConfig } from '../../services/customChartService';
import ChartLegend from './ChartLegend';

const CustomChart = ({
	title,
	type,
	series,
	xAxis,
	legends,
	customConfig,
	yAxisGroups,
	activeLegendItems,
	containerClass,
	onLegendChange
}) => {
	if (type === 'line' || type === 'spline') {
		const chartConfig = getCustomChartConfig(
			type,
			series,
			xAxis,
			customConfig,
			yAxisGroups,
			activeLegendItems
		);

		if (chartConfig.yAxis) {
			chartConfig.chart = {
				...chartConfig.chart,
				events: {
					load: event => {
						const chart = event.target;

						const node = document.getElementById('chart-legend-wrap');
						if (legends && legends.length > 0)
							ReactDOM.render(
								<ChartLegend
									chart={chart}
									legends={legends}
									activeLegendItems={activeLegendItems}
									onLegendChange={onLegendChange}
								/>,
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
	xAxis: PropTypes.shape({ categories: PropTypes.array.isRequired, className: PropTypes.string }),
	customConfig: PropTypes.object,
	yAxisGroups: PropTypes.arrayOf(
		PropTypes.shape({
			seriesNames: PropTypes.arrayOf(PropTypes.string).isRequired,
			yAxisConfig: PropTypes.object
		})
	),
	containerClass: PropTypes.string
};

CustomChart.defaultProps = {
	title: '',
	type: 'spline',
	xAxis: {},
	legends: [],
	customConfig: {},
	yAxisGroups: [],
	activeLegendItems: [],
	containerClass: ''
};

export default CustomChart;
