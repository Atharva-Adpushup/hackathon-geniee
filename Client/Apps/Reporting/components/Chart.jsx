import React from 'react';

import { groupBy, sortBy, find } from 'lodash';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import { displayMetrics, activeLegendItem, activeLegendItems } from '../configs/commonConsts';
import apLineChartConfig from '../configs/line-ap-data.json';

class Chart extends React.Component {
	state = {
		type: 'spline',
		xAxis: { categories: [] },
		startDate: this.props.startDate,
		endDate: this.props.endDate,
		selectedDimension: this.props.selectedDimension,
		selectedInterval: this.props.selectedInterval,
		legends: displayMetrics,
		activeLegendItems: this.props.selectedDimension ? activeLegendItem : activeLegendItems,
		series: [],
		tableData: this.props.tableData
	};

	enumerateDaysBetweenDates = () => {
		const { startDate, endDate, xAxis, selectedInterval } = this.state;
		const dates = [];

		const currDate = moment(startDate).startOf('day');
		const lastDate = moment(endDate).startOf('day');

		switch (selectedInterval) {
			default:
			case 'daily':
				while (currDate.diff(lastDate) <= 0) {
					dates.push(currDate.clone().format('ll'));
					currDate.add(1, 'days');
				}
				break;
			case 'monthly':
				while (currDate.diff(lastDate, 'months') <= 0) {
					dates.push(currDate.format('MMM, YYYY'));
					console.log(currDate.format('MMM, YYYY'));
					currDate.add(1, 'month');
				}
				break;
			case 'cumulative':
				dates.push(currDate.format('ll') + ' to ' + lastDate.format('ll'));
				break;
		}

		xAxis.categories = dates;
		this.setState(xAxis);
	};

	componentDidUpdate(prevProps) {
		if (prevProps.tableData !== this.props.tableData) {
			const { tableData, selectedDimension, selectedInterval, startDate, endDate } = this.props;
			let { legends } = this.state;
			if (tableData.result && tableData.result.length > 0) {
				const totalRow = tableData.total;
				legends.forEach(legend => {
					legend.total = totalRow['total_' + legend.value];
				});
			}
			this.setState(
				{
					legends,
					tableData,
					selectedDimension,
					selectedInterval,
					startDate,
					endDate,
					activeLegendItems: selectedDimension ? activeLegendItem : activeLegendItems
				},
				() => {
					this.updateChartData();
				}
			);
		}
	}

	componentDidMount() {
		let { legends } = this.state;
		const { tableData } = this.props;
		if (tableData.result && tableData.result.length > 0) {
			const totalRow = tableData.total;
			legends.forEach(legend => {
				legend.total = totalRow['total_' + legend.value];
			});
		}
		this.setState({ legends });
		this.updateChartData();
	}

	updateChartData = activeLegendItem => {
		this.enumerateDaysBetweenDates();
		const { selectedDimension, metrics } = this.props;
		let { xAxis, tableData, activeLegendItems } = this.state;
		const series = [];
		const rows = tableData.result;
		if (tableData.result && tableData.result.length > 0) {
			if (selectedDimension) {
				const groupByResult = groupBy(rows, row => row[selectedDimension]);
				activeLegendItems = activeLegendItem || activeLegendItems;
				for (const results in groupByResult) {
					const { valueType } = metrics[activeLegendItems.value];
					const serie = {
						data: [],
						name: results,
						valueType
					};
					groupByResult[results] = sortBy(groupByResult[results], result => result.date);
					for (let i = 0; i < xAxis.categories.length; i++) {
						const found = find(
							groupByResult[results],
							result => result.date === xAxis.categories[i]
						);
						if (found) serie.data.push(found[activeLegendItems.value]);
						else serie.data.push(0);
					}
					series.push(serie);
				}
			} else {
				let sortedResult = sortBy(rows, row => row.date);
				const groupByResult = {};
				sortedResult.map(result => {
					displayMetrics.forEach(metric => {
						let metricValue = metric.value;
						if (!groupByResult[metricValue]) groupByResult[metricValue] = [];
						groupByResult[metricValue].push(result[metricValue]);
					});
				});
				for (let col in groupByResult) {
					const { display_name, valueType } = metrics[col];
					let serie = {
						name: display_name,
						value: col,
						data: groupByResult[col],
						valueType
					};
					series.push(serie);
				}
			}
		}
		this.setState({ series, activeLegendItems });
	};

	render() {
		const { type, series, xAxis, legends, activeLegendItems, tableData } = this.state;
		const { selectedDimension } = this.props;
		if (tableData && tableData.result && tableData.result.length > 0)
			return (
				<div>
					<CustomChart
						type={type}
						series={series}
						xAxis={xAxis}
						legends={legends}
						activeLegendItems={activeLegendItems}
						updateChartData={this.updateChartData}
						yAxisGroups={selectedDimension ? [] : apLineChartConfig.defaultYAxisGroups}
					/>
				</div>
			);
		else return '';
	}
}

export default Chart;
