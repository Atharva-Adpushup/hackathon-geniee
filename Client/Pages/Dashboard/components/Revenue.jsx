import React from 'react';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { yAxisGroups } from '../configs/commonConsts';
import { roundOffTwoDecimal } from '../helpers/utils';

class SitewiseReport extends React.Component {
	state = {
		series: [],
		yAxisGroupsData: yAxisGroups
	};

	componentDidMount() {
		const { displayData } = this.props;
		this.computeGraphData(displayData);
	}

	getPieChartLabelData = inputData => {
		const { metrics, filter } = this.props;
		const isValidData = !!(
			inputData.columns &&
			inputData.columns.length &&
			inputData.result &&
			inputData.result.length
		);
		const resultObj = {
			legend: '',
			name: '',
			metric: '',
			metricValueType: ''
		};

		if (!isValidData) {
			return resultObj;
		}

		const metricLabel = inputData.columns[0];
		const filterLabel = inputData.columns[1];
		const isValidMetricLabel = !!(metricLabel && metrics[metricLabel]);
		const isValidFilterLabel = !!(filterLabel && filter[filterLabel]);
		const isValidLabels = isValidMetricLabel && isValidFilterLabel;

		if (!isValidLabels) {
			return resultObj;
		}

		resultObj.legend = metrics[metricLabel].display_name;
		resultObj.metricValueType = metrics[metricLabel].valueType;
		resultObj.name = filterLabel;
		resultObj.metric = metricLabel;

		return resultObj;
	};

	getValidLabels = reportData => {
		const labels = this.getPieChartLabelData(reportData);
		const isValid = !!(
			labels &&
			labels.legend &&
			labels.name &&
			labels.metric &&
			labels.metricValueType
		);
		const resultData = { labels, isValid };

		return resultData;
	};

	getComputedYAxisGroups = inputData => {
		const resultData = [...inputData];
		const firstSeries = resultData[0];

		firstSeries.seriesNames = [];
		firstSeries.yAxisConfig = {
			labels: {
				format: '{value}'
			}
		};

		resultData[0] = { ...firstSeries };
		return resultData;
	};

	computeGraphData = reportData => {
		const { result: resultData } = reportData;
		const { yAxisGroupsData } = this.state;
		const labelData = this.getValidLabels(reportData);
		const legendLabel = (labelData.isValid && labelData.labels.legend) || 'Revenue';
		const nameLabel = (labelData.isValid && labelData.labels.name) || 'network';
		const metricLabel = (labelData.isValid && labelData.labels.metric) || 'revenue';
		const metricValueType = (labelData.isValid && labelData.labels.metricValueType) || 'money';
		const isMetricLabelRevenue = !!(metricLabel === 'revenue');
		const computedYAxisGroups = isMetricLabelRevenue
			? yAxisGroupsData
			: this.getComputedYAxisGroups(yAxisGroupsData);
		const series = [
			{
				name: legendLabel,
				colorByPoint: true,
				data: []
			}
		];
		const seriesData = [];

		if (resultData) {
			resultData.forEach(result => {
				const computedY = isMetricLabelRevenue
					? parseFloat(roundOffTwoDecimal(result[metricLabel]))
					: result[metricLabel];

				seriesData.push({
					name: result[nameLabel],
					y: computedY,
					valueType: metricValueType
				});
			});
		}

		series[0].data = seriesData;
		this.setState({ series, yAxisGroupsData: computedYAxisGroups });
	};

	renderChart() {
		const type = 'pie';
		const { series, yAxisGroupsData } = this.state;
		if (series && series.length && series[0].data && series[0].data.length)
			return (
				<div>
					<CustomChart
						type={type}
						xAxis={data.xAxis}
						series={series}
						yAxisGroups={yAxisGroupsData}
					/>
				</div>
			);
		return <div className="text-center">No Record Found.</div>;
	}

	render() {
		return this.renderChart();
	}
}

export default SitewiseReport;
