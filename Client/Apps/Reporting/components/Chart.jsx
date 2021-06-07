import React from 'react';

import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import { chart } from 'highcharts';
import CustomChart from '../../../Components/CustomChart';
import {
	activeLegendItem,
	displayMetrics,
	AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY,
	TERMS,
	METRICS,
	columnsBlacklistedForAddition
} from '../configs/commonConsts';
import {
	getValidArray,
	getValidObject,
	getItemFromLocalStorage,
	setItemToLocalStorage,
	roundOffTwoDecimal,
	numberWithCommas
} from '../helpers/utils';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		const { selectedDimension, metricsList } = props;
		const xAxis = this.enumerateDaysBetweenDates();
		const activeLegendItems = this.getActiveLegendItems(metricsList);
		const series = this.updateChartData(metricsList, activeLegendItems, xAxis);
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

	componentWillReceiveProps({ metricsList: nextMetricsList, metricsList }) {
		const { metricsList: currMetricsList } = this.props;

		if (
			currMetricsList.length !== nextMetricsList.length ||
			!isEqual(currMetricsList, nextMetricsList)
		) {
			const activeLegendItems = this.getActiveLegendItems(nextMetricsList);
			const series = this.updateChartData(metricsList, activeLegendItems);

			this.setState({ activeLegendItems, series });
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		const {
			metricsList: currMetricsList,
			isCustomizeChartLegend,
			isCustomizeChartLegend: isCustomizeChartLegendCurr
		} = this.props;
		const {
			metricsList: nextMetricsList,
			isCustomizeChartLegend: isCustomizeChartLegendNext
		} = nextProps;

		let shouldUpdate = false;

		shouldUpdate =
			shouldUpdate || (isCustomizeChartLegend && isEqual(currMetricsList, nextMetricsList));

		if (Array.isArray(this.state.activeLegendItems)) {
			shouldUpdate =
				shouldUpdate || this.state.activeLegendItems.length !== nextState.activeLegendItems.length;
		}

		if (!Array.isArray(this.state.activeLegendItems)) {
			shouldUpdate = shouldUpdate || this.state.activeLegendItems !== nextState.activeLegendItems;
		}

		if (!isCustomizeChartLegendCurr) {
			shouldUpdate = shouldUpdate || !!isCustomizeChartLegendNext;
		}

		return shouldUpdate;
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

	getActiveLegendItems = metricsList => {
		const { selectedDimension, selectedChartLegendMetric } = this.props;
		const metricsListCopy = cloneDeep(metricsList);
		const firstThreeMetrics = metricsListCopy.slice(0, 3);

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
			if (!selectedDimension && Array.isArray(activeItemsFromLocalStorage)) {
				const computedActiveItemsFromLocalStorage = activeItemsFromLocalStorage.filter(
					storageLegend =>
						!!metricsListCopy.find(selectedMetric => selectedMetric.value === storageLegend.value)
				);

				computedItems = computedActiveItemsFromLocalStorage.length
					? computedActiveItemsFromLocalStorage
					: firstThreeMetrics;
			} else {
				computedItems =
					metricsListCopy.find(
						selectedMetric => selectedMetric.value === activeItemsFromLocalStorage.value
					) ||
					metricsListCopy.find(selectedMetric => selectedMetric.value === activeLegendItem.value) ||
					metricsListCopy[0];
			}
		} else if (selectedDimension) {
			computedItems =
				metricsListCopy.find(selectedMetric => selectedMetric.value === activeLegendItem.value) ||
				metricsListCopy[0];
		} else {
			computedItems = firstThreeMetrics;
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

	getGroupByResult = (rows, metricsList) => {
		let groupByResult = {};

		if (rows && rows.length > 0) {
			const { selectedDimension } = this.props;
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

	getAggregratedSortedResult = (data, selectedInterval) => {
		const aggregratedData = {};
		if (selectedInterval === 'daily' || selectedInterval === 'cumulative') {
			for (let i = 0; i < data.length; i++) {
				const rowData = cloneDeep(data[i]);
				const {
					date,
					adpushup_page_views = 0,
					bot_page_views = 0,
					network_gross_revenue = 0,
					network_impressions = 0,
					network_net_revenue = 0,
					unique_impressions = 0
				} = rowData;
				if (aggregratedData[date]) {
					aggregratedData[date].adpushup_page_views += adpushup_page_views;
					aggregratedData[date].bot_page_views += bot_page_views;
					aggregratedData[date].network_gross_revenue += network_gross_revenue;
					aggregratedData[date].network_impressions += network_impressions;
					aggregratedData[date].network_net_revenue += network_net_revenue;
					aggregratedData[date].unique_impressions += unique_impressions;
				} else {
					aggregratedData[date] = rowData;
				}
			}
		}
		if (selectedInterval === 'monthly') {
			for (let i = 0; i < data.length; i += 1) {
				const rowData = cloneDeep(data[i]);
				const { month, year } = rowData;
				aggregratedData[`${month}-${year}`] = rowData;
			}
		}
		Object.keys(aggregratedData).forEach(date => {
			const {
				adpushup_page_views,
				network_impressions,
				network_net_revenue,
				unique_impressions
			} = aggregratedData[date];
			aggregratedData[date].adpushup_page_cpm = (network_net_revenue / adpushup_page_views) * 1000;
			aggregratedData[date].network_ad_ecpm = (network_net_revenue / network_impressions) * 1000;
			aggregratedData[date].unique_ad_ecpm = (network_net_revenue / unique_impressions) * 1000;
		});
		const resultOfAggreagratedData = Object.values(aggregratedData);
		if (selectedInterval === 'daily') return sortBy(resultOfAggreagratedData, 'date');
		if (selectedInterval === 'monthly')
			return sortBy(sortBy(resultOfAggreagratedData, 'month'), 'year');
		return resultOfAggreagratedData;
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
			const sortedResult = this.getAggregratedSortedResult(row, selectedInterval);
			for (let i = 0; i < xAxis.categories.length; i += 1) {
				const xAxisMomentObj = moment(xAxis.categories[i]);

				if (
					selectedDimension !== 'page_variation' ||
					(selectedDimension === 'page_variation' &&
						sortedResult.length === xAxis.categories.length)
				) {
					if (!sortedResult[j]) break;
					const column = sortedResult[j];
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
				} else {
					const duplicateDateValues = sortedResult.filter(
						val => val.date === xAxisMomentObj.format('YYYY-MM-DD')
					);

					let combinedSeriesValue = 0;

					if (!columnsBlacklistedForAddition.includes(activeLegendItems.value)) {
						combinedSeriesValue = duplicateDateValues.reduce(
							(prev, cur) => prev + cur[activeLegendItems.value],
							0
						);
					} else if (activeLegendItems.value === 'adpushup_ad_ecpm') {
						combinedSeriesValue =
							(duplicateDateValues.reduce((prev, cur) => prev + cur.network_net_revenue, 0) /
								duplicateDateValues.reduce((prev, cur) => prev + cur.adpushup_impressions, 0)) *
							1000;
					} else if (
						activeLegendItems.value === 'network_ad_ecpm' ||
						activeLegendItems.value === 'unique_ad_ecpm'
					) {
						combinedSeriesValue =
							(duplicateDateValues.reduce((prev, cur) => prev + cur.network_net_revenue, 0) /
								duplicateDateValues.reduce((prev, cur) => prev + cur.network_impressions, 0)) *
							1000;
					} else if (activeLegendItems.value === 'adpushup_page_cpm') {
						combinedSeriesValue =
							(duplicateDateValues.reduce((prev, cur) => prev + cur.network_net_revenue, 0) /
								duplicateDateValues.reduce((prev, cur) => prev + cur.adpushup_page_views, 0)) *
							1000;
					} else if (activeLegendItems.value === 'adpushup_xpath_miss_percent') {
						combinedSeriesValue = parseFloat(
							(
								(duplicateDateValues.reduce((prev, cur) => prev + cur.adpushup_xpath_miss, 0) /
									(duplicateDateValues.reduce((prev, cur) => prev + cur.adpushup_xpath_miss, 0) +
										duplicateDateValues.reduce(
											(prev, cur) => prev + cur.adpushup_impressions,
											0
										))) *
								100
							).toFixed(2)
						);
					}
					serie.data.push(combinedSeriesValue);
				}
			}
			series.push(serie);
		});
		return series;
	};

	onLegendChange = activeLegendItems => {
		const { metricsList } = this.props;
		const series = this.updateChartData(metricsList, activeLegendItems);

		this.setActiveLegendItemsToLocalStorage(activeLegendItems);
		this.setState({
			series,
			activeLegendItems
		});
	};

	updateChartData = (metricsList, activeLegendItems, xAxisData) => {
		const { tableData } = this.props;
		const { xAxis } = this.state || {};
		const computedXAxisData = xAxisData || xAxis;
		const groupByResult = this.getGroupByResult(tableData.result, metricsList);
		const series = this.getSeriesData(groupByResult, computedXAxisData, activeLegendItems);
		return series;
	};

	render() {
		const {
			allAvailableMetrics,
			reportType,
			updateMetrics,
			isCustomizeChartLegend,
			index,
			dimension,
			isForOps
		} = this.props;

		const { type, series, xAxis, activeLegendItems, selectedDimension } = this.state;

		return (
			<div>
				<CustomChart
					type={type}
					series={series}
					xAxis={xAxis}
					legends={this.computeLegends()}
					activeLegendItems={activeLegendItems}
					onLegendChange={this.onLegendChange}
					yAxisGroups={selectedDimension ? [] : null}
					availableLegends={allAvailableMetrics}
					reportType={reportType}
					isCustomizeChartLegend={isCustomizeChartLegend}
					updateMetrics={updateMetrics}
					index={index}
				/>
				{selectedDimension && series.length ? (
					<span className="chartLabels">
						<b>{dimension[selectedDimension].display_name}-Wise Report</b>
					</span>
				) : null}
			</div>
		);
		// else return '';
	}
}

export default Chart;
