import React from 'react';

import { groupBy, sortBy } from 'lodash';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import { activeLegendItem, activeLegendItemArray } from '../configs/commonConsts';
import apLineChartConfig from '../configs/line-ap-data.json';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		const { selectedDimension } = props;
		const xAxis = this.enumerateDaysBetweenDates();
		const activeLegendItems = selectedDimension ? activeLegendItem : activeLegendItemArray;
		const series = this.updateChartData(activeLegendItems, xAxis);
		const legends = this.computeLegends();
		this.state = {
			type: 'spline',
			xAxis,
			legends,
			activeLegendItems,
			series,
			selectedDimension
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.activeLegendItems !== nextState.activeLegendItems;
	}

	computeLegends = () => {
		const { tableData, metricsList } = this.props;
		const legends = [...metricsList];
		if (tableData.result && tableData.result.length > 0) {
			const totalRow = tableData.total;
			legends.forEach(legend => {
				legend.total = totalRow[`total_${legend.value}`];
			});
		}
		return legends;
	};

	enumerateDaysBetweenDates = () => {
		const xAxis = { categories: [] };
		const { startDate, endDate, selectedInterval } = this.props;
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
				dates.push(`${currDate.format('ll')} to ${lastDate.format('ll')}`);
				break;
		}

		xAxis.categories = dates;
		return xAxis;
	};

	getGroupByResult = rows => {
		let groupByResult = {};

		if (rows && rows.length > 0) {
			const { selectedDimension, metricsList } = this.props;
			if (selectedDimension) {
				groupByResult = groupBy(rows, selectedDimension);
			} else {
				rows.map(result => {
					metricsList.forEach(metric => {
						if (!metric.isDisabled) {
							const { value, name, valueType } = metric;
							const data = {
								date: result.date,
								month: result.month,
								year: result.year,
								name,
								valueType,
								value: result[value]
							};
							if (!groupByResult[value]) groupByResult[value] = [];
							groupByResult[value].push(data);
						}
					});
				});
			}
			return groupByResult;
		}
	};

	getSortedResult = (data, selectedInterval) => {
		if (selectedInterval === 'daily') return sortBy(data, 'date');
		if (selectedInterval === 'monthly') return sortBy(sortBy(data, 'month'), 'year');
		return data;
	};

	getSeriesData = (groupByResult, xAxis, activeLegendItems) => {
		const { selectedDimension, selectedInterval } = this.props;
		const series = [];
		Object.keys(groupByResult).forEach(results => {
			let j = 0;
			const serie = {
				data: [],
				name: selectedDimension ? results : groupByResult[results][0].name,
				value: results,
				valueType: selectedDimension
					? activeLegendItems.valueType
					: groupByResult[results][0].valueType
			};
			const sortedResult = this.getSortedResult(groupByResult[results], selectedInterval);
			for (let i = 0; i < xAxis.categories.length; i += 1) {
				if (!sortedResult[j]) break;
				const column = sortedResult[j];
				const xAxisMomentObj = moment(xAxis.categories[i]);
				const seriesValue = selectedDimension ? column[activeLegendItems.value] : column.value;
				if (selectedInterval === 'daily' || selectedInterval === 'monthly')
					if (
						column.date === xAxisMomentObj.format('YYYY-MM-DD') ||
						(column.month === xAxisMomentObj.format('M') &&
							column.year === xAxisMomentObj.format('Y'))
					) {
						serie.data.push(seriesValue);
						j += 1;
					} else {
						serie.data.push(0);
					}
				else {
					serie.data.push(seriesValue);
				}
			}
			series.push(serie);
		});
		return series;
	};

	onLegendChange = activeLegendItems => {
		const series = this.updateChartData(activeLegendItems);
		this.setState({
			series,
			activeLegendItems
		});
	};

	updateChartData = (activeLegendItems, xAxisData) => {
		const { tableData } = this.props;
		const xAxis = xAxisData || this.state.xAxis;
		const groupByResult = this.getGroupByResult(tableData.result);
		const series = this.getSeriesData(groupByResult, xAxis, activeLegendItems);
		return series;
	};

	render() {
		const { type, series, xAxis, legends, activeLegendItems, selectedDimension } = this.state;
		return (
			<div>
				<CustomChart
					type={type}
					series={series}
					xAxis={xAxis}
					legends={legends}
					activeLegendItems={activeLegendItems}
					onLegendChange={this.onLegendChange}
					yAxisGroups={selectedDimension ? [] : apLineChartConfig.defaultYAxisGroups}
				/>
			</div>
		);
		// else return '';
	}
}

export default Chart;
