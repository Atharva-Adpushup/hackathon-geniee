import React from 'react';

import { groupBy, sortBy, find, chain } from 'lodash';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import { activeLegendItem, activeLegendItems } from '../configs/commonConsts';
import apLineChartConfig from '../configs/line-ap-data.json';

class Chart extends React.Component {
	state = {
		type: 'spline',
		xAxis: { categories: [] },
		startDate: this.props.startDate,
		endDate: this.props.endDate,
		selectedDimension: this.props.selectedDimension,
		selectedInterval: this.props.selectedInterval,
		legends: this.props.metricsList,
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
				while (lastDate > currDate || currDate.format('M') === lastDate.format('M')) {
					dates.push(currDate.format('MMM, YYYY'));
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
		const { selectedDimension, metricsList, selectedInterval } = this.props;
		let { xAxis, tableData, activeLegendItems } = this.state;
		const series = [];
		const rows = tableData.result;
		if (tableData.result && tableData.result.length > 0) {
			if (selectedDimension) {
				activeLegendItems = activeLegendItem || activeLegendItems;
				let groupByResult = rows.map(row => {
					return {
						date: row.date,
						month: row.month,
						year: row.year,
						[activeLegendItems.value]: row[activeLegendItems.value],
						[selectedDimension]: row[selectedDimension]
					};
				});
				groupByResult = groupBy(groupByResult, result => result[selectedDimension]);
				const { valueType } = activeLegendItems;
				for (const results in groupByResult) {
					const serie = {
						data: [],
						name: results,
						valueType
					};
					for (let i = 0; i < xAxis.categories.length; i++) {
						const found = find(groupByResult[results], result => {
							if (selectedInterval === 'daily')
								return result.date === moment(xAxis.categories[i]).format('YYYY-MM-DD');
							else if (selectedInterval === 'monthly')
								return (
									result.month == moment(xAxis.categories[i]).format('M') &&
									result.year == moment(xAxis.categories[i]).format('Y')
								);
							return true;
						});
						if (found) serie.data.push(found[activeLegendItems.value]);
						else serie.data.push(0);
					}
					series.push(serie);
				}
			} else {
				let sortedResult = rows;
				const groupByResult = {};
				sortedResult.map(result => {
					metricsList.forEach(metric => {
						if (!metricsList.isDisabled) {
							let metricType = metric.value;
							let metricName = metric.name;
							let valueType = metric.valueType;
							let data = {
								value: result[metricType],
								date: result['date'],
								month: result['month'],
								year: result['year'],
								valueType,
								metricName
							};
							if (!groupByResult[metricType]) groupByResult[metricType] = [];
							groupByResult[metricType].push(data);
						}
					});
				});
				for (const results in groupByResult) {
					const serie = {
						data: [],
						value: results,
						valueType: groupByResult[results][0].valueType,
						name: groupByResult[results][0].metricName
					};
					for (let i = 0; i < xAxis.categories.length; i++) {
						const found = find(groupByResult[results], result => {
							if (selectedInterval === 'daily')
								return result.date === moment(xAxis.categories[i]).format('YYYY-MM-DD');
							else if (selectedInterval === 'monthly')
								return (
									result.month == moment(xAxis.categories[i]).format('M') &&
									result.year == moment(xAxis.categories[i]).format('Y')
								);
							return true;
						});
						if (found) serie.data.push(found['value']);
						else serie.data.push(0);
					}
					series.push(serie);
				}
			}
		}
		this.setState({ series, activeLegendItems });
	};

	render() {
		const { type, series, xAxis, legends, activeLegendItems, tableData } = this.state;
		const { selectedDimension } = this.props;
		//if (tableData && tableData.result && tableData.result.length > 0)
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
		//else return '';
	}
}

export default Chart;
