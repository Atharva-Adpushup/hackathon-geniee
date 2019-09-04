import React from 'react';

import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import CustomChart from '../../../Components/CustomChart';
import {
	activeLegendItem,
	activeLegendItemArray,
	displayMetrics,
	AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY,
	TERMS,
	METRICS
} from '../configs/commonConsts';
import {
	getValidArray,
	getValidObject,
	getItemFromLocalStorage,
	setItemToLocalStorage
} from '../helpers/utils';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		const { selectedDimension } = props;
		const xAxis = this.enumerateDaysBetweenDates();
		const activeLegendItems = this.getActiveLegendItems();
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
		if (Array.isArray(this.state.activeLegendItems))
			return this.state.activeLegendItems.length !== nextState.activeLegendItems.length;
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

	checkValidChartLegendMetric = (
		selectedDimension,
		selectedChartLegendMetric,
		activeItemsByChartLegendMetric
	) => {
		const { PAGE_VARIATION_TYPE } = TERMS;
		const {
			ADPUSHUP_PAGE_CPM: { value: adpushupPageCPM }
		} = METRICS;
		const isValid = !!(
			selectedDimension &&
			selectedChartLegendMetric &&
			(selectedDimension === PAGE_VARIATION_TYPE &&
				selectedChartLegendMetric === adpushupPageCPM) &&
			activeItemsByChartLegendMetric.length
		);

		return isValid;
	};

	getActiveLegendItems = () => {
		const { selectedDimension, selectedChartLegendMetric } = this.props;
		let computedItems = [];
		const activeItemsFromLocalStorage = this.getActiveLegendItemsFromLocalStorage();
		const activeItemsByChartLegendMetric = displayMetrics.filter(
			legendItem => legendItem.value === selectedChartLegendMetric
		);
		const isValidChartLegendMetricItems = this.checkValidChartLegendMetric(
			selectedDimension,
			selectedChartLegendMetric,
			activeItemsByChartLegendMetric
		);

		if (isValidChartLegendMetricItems) {
			[computedItems] = activeItemsByChartLegendMetric;
		} else if (activeItemsFromLocalStorage) {
			computedItems = activeItemsFromLocalStorage;
		} else if (selectedDimension) {
			computedItems = activeLegendItem;
		} else {
			computedItems = activeLegendItemArray;
		}

		return computedItems;
	};

	getTransformedLocalStorageItem = item => {
		const { selectedDimension } = this.props;
		const isValidItem = !!item;
		const isItemArray = !!(isValidItem && getValidArray(item));
		const isItemObject = !!(isValidItem && getValidObject(item));
		const isValidLocalStorageItems = !!(isValidItem && (isItemArray || isItemObject));
		const isItemArrayWithSelectedDimension = !!(isItemArray && selectedDimension);
		const isItemObjectWithNoSelectedDimension = !!(isItemObject && !selectedDimension);

		if (!isValidLocalStorageItems) {
			return false;
		}

		let computedItem = item;

		if (isItemArrayWithSelectedDimension) {
			computedItem = item.concat([]);
			[computedItem] = computedItem;
		} else if (isItemObjectWithNoSelectedDimension) {
			computedItem = { ...item };
			computedItem = [computedItem];
		}

		return computedItem;
	};

	getActiveLegendItemsFromLocalStorage = () => {
		let item = getItemFromLocalStorage(AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY);

		try {
			item = JSON.parse(window.atob(item));
		} catch (e) {
			item = false;
		}

		item = this.getTransformedLocalStorageItem(item);

		if (!item) {
			return false;
		}

		return item;
	};

	setActiveLegendItemsToLocalStorage = item => {
		let computedItem = this.getTransformedLocalStorageItem(item);

		computedItem = window.btoa(JSON.stringify(computedItem));
		setItemToLocalStorage(AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY, computedItem);
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
		}
		return groupByResult;
	};

	getSortedResult = (data, selectedInterval) => {
		if (selectedInterval === 'daily') return sortBy(data, 'date');
		if (selectedInterval === 'monthly') return sortBy(sortBy(data, 'month'), 'year');
		return data;
	};

	getSeriesData = (groupByResult, xAxis, activeLegendItems) => {
		const { selectedDimension, selectedInterval, site } = this.props;
		const series = [];
		Object.keys(groupByResult).forEach(results => {
			let j = 0;
			let seriesName = results;
			const row = groupByResult[results];
			if (selectedDimension == 'siteid')
				seriesName = site && site[results] ? site[results].siteName : 'Not Found';
			const serie = {
				data: [],
				name: selectedDimension ? seriesName : row[0].name,
				value: results,
				valueType: selectedDimension ? activeLegendItems.valueType : row[0].valueType
			};
			const sortedResult = this.getSortedResult(row, selectedInterval);
			for (let i = 0; i < xAxis.categories.length; i += 1) {
				if (!sortedResult[j]) break;
				const column = sortedResult[j];
				const xAxisMomentObj = moment(xAxis.categories[i]);
				const seriesValue = selectedDimension ? column[activeLegendItems.value] : column.value;

				if (selectedInterval === 'daily' || selectedInterval === 'monthly')
					if (
						column.date == xAxisMomentObj.format('YYYY-MM-DD') ||
						(column.month == xAxisMomentObj.format('M') &&
							column.year == xAxisMomentObj.format('Y'))
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

		this.setActiveLegendItemsToLocalStorage(activeLegendItems);
		this.setState({
			series,
			activeLegendItems
		});
	};

	updateChartData = (activeLegendItems, xAxisData) => {
		const { tableData } = this.props;
		const { xAxis } = this.state || {};
		const computedXAxisData = xAxisData || xAxis;
		const groupByResult = this.getGroupByResult(tableData.result);
		const series = this.getSeriesData(groupByResult, computedXAxisData, activeLegendItems);
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
					yAxisGroups={selectedDimension ? [] : null}
				/>
			</div>
		);
		// else return '';
	}
}

export default Chart;
