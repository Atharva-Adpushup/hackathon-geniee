/* eslint-disable no-prototype-builtins */
import React, { Component } from 'react';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import { Row, Col, Alert } from '@/Client/helpers/react-bootstrap-imports';
import moment from 'moment';
import qs from 'querystringify';
import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import sortBy from 'lodash/sortBy';
import ActionCard from '../../../Components/ActionCard/index';
import Empty from '../../../Components/Empty/index';
import ControlContainer from '../containers/ControlContainer';
import TableContainer from '../containers/TableContainer';
import ChartContainer from '../containers/HBAnalytics/ChartContainer';
import BidCPMStatChartContainer from '../containers/HBAnalytics/BidCPMStatChartContainer';
import hbAnalyticService from '../../../services/hbAnalyticService';
import CustomToggle from './HBAnalytics/CustomToggle';

import {
	displayHBMetrics,
	displayHBCharts,
	extraMetricsListForHB,
	extraMetricsListMappingForHBArray,
	opsDimension,
	opsFilter,
	REPORT_INTERVAL_TABLE_KEYS,
	columnsBlacklistedForAddition,
	PIVOT,
	MUST_HAVE_COLS,
	BID_CPM_STATS_BUCKET_MODE,
	ANOMALY_THRESHOLD_CONSTANT
} from '../configs/commonConsts';
import { DEMO_ACCOUNT_DATA } from '../../../constants/others';
import Loader from '../../../Components/Loader';
import { convertObjToArr, roundOffTwoDecimal } from '../helpers/utils';
import {
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites
} from '../../../helpers/commonFunctions';

function oldConsoleRedirection(e) {
	e.preventDefault();
	const now = new Date();
	now.setHours(now.getHours() + 2);
	document.cookie = `app_redirect=0; path=/; expires=${now.toUTCString()}; domain=adpushup.com`;
	setTimeout(() => {
		window.open('https://old-console.adpushup.com');
	}, 500);
}

class Report extends Component {
	constructor(props) {
		super(props);
		const selectedMetrics = displayHBMetrics
			.filter(metrics => metrics.visible)
			.map(metrics => metrics.value);

		this.state = {
			dimensionList: [],
			filterList: [],
			intervalList: [],
			displayHBCharts,
			chartData: [],
			displayHBMetrics,
			metricsList: [],
			selectedDimension: PIVOT,
			selectedFilters: {},
			selectedMetrics: selectedMetrics || [],
			selectedCharts: [],
			selectedInterval: 'daily',
			selectedChartLegendMetric: '',
			prevGraphData: {},
			startDate: moment()
				.startOf('day')
				.subtract(7, 'days')
				.format('YYYY-MM-DD'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
				.format('YYYY-MM-DD'),
			tableData: {},
			csvData: [],
			reportType: props.reportType || 'account',
			isLoading: true,
			isValidSite: true,
			isReportingSite: true,
			isDefaultBucketEnabled: true,
			show: true
		};
	}

	componentDidMount() {
		const { userSites, updateReportMetaData, hbAnalyticsMeta, isForOps } = this.props;
		const { email, reportType } = this.getDemoUserParams();

		let userSitesStr = '';
		let isSuperUser = false;

		if (!isForOps && reportType === 'account') {
			userSitesStr = Object.keys(userSites).toString();

			userSitesStr = getReportingDemoUserSiteIds(userSitesStr, email, reportType);
		}

		if (isForOps || reportType === 'global') {
			isSuperUser = true;
		}

		const { showNotification } = this.props;
		if (!hbAnalyticsMeta.fetched) {
			return hbAnalyticService
				.getMetaData({ sites: userSitesStr, isSuperUser, product: 'hb-analytics' })
				.then(response => {
					let { data: computedData } = response;
					computedData = getDemoUserSites(computedData, email);
					updateReportMetaData(computedData);
					return this.getContentInfo(computedData);
				})
				.catch(err => {
					// eslint-disable-next-line no-console
					console.error(err);
					showNotification({
						mode: 'error',
						title: 'Error',
						message: 'Network Error - Failed to load Meta'
					});
				});
		}

		return this.getContentInfo(hbAnalyticsMeta.data);
	}

	removeOpsFilterDimension = (filterList, dimensionList) => {
		const updatedFilterList = [];
		const updatedDimensionList = [];
		filterList.forEach(fil => {
			const index = opsFilter.indexOf(fil.value);
			if (index === -1) updatedFilterList.push(fil);
		});
		dimensionList.forEach(dim => {
			const index = opsDimension.indexOf(dim.value);
			if (index === -1) updatedDimensionList.push(dim);
		});
		return { updatedDimensionList, updatedFilterList };
	};

	isControlItemDisabled = (item, disabledItemsList, reportType) => {
		const isDisabledByDefault =
			(reportType === 'account' || reportType === 'global') &&
			typeof item.default_enabled === 'boolean' &&
			!item.default_enabled;

		if (isDisabledByDefault) return true;

		return !!disabledItemsList.find(fil => fil === item.value);
	};

	disableControl = (
		disabledFilter,
		disabledDimension,
		disabledMetrics,
		metricsList,
		reportType
	) => {
		const { metricsList: metricsListFromState } = this.state;
		const computedMetricsList = metricsList || metricsListFromState;

		const {
			hbAnalyticsMeta,
			user: {
				data: { isSuperUser }
			}
		} = this.props;

		const { dimension: dimensionListObj, filter: filterListObj } = hbAnalyticsMeta.data;
		const dimensionList = convertObjToArr(dimensionListObj);
		const filterList = convertObjToArr(filterListObj);
		const { updatedDimensionList, updatedFilterList } = isSuperUser
			? { updatedDimensionList: dimensionList, updatedFilterList: filterList }
			: this.removeOpsFilterDimension(filterList, dimensionList);

		updatedFilterList.forEach(filter => {
			// eslint-disable-next-line no-param-reassign
			filter.isDisabled = this.isControlItemDisabled(filter, disabledFilter, reportType);
		});

		updatedDimensionList.forEach(dimension => {
			// eslint-disable-next-line no-param-reassign
			dimension.isDisabled = this.isControlItemDisabled(dimension, disabledDimension, reportType);
		});

		computedMetricsList.forEach(metrics => {
			// eslint-disable-next-line no-param-reassign
			metrics.isDisabled = this.isControlItemDisabled(metrics, disabledMetrics, reportType);
		});

		return {
			updatedFilterList,
			metricsList: computedMetricsList,
			updatedDimensionList
		};
	};

	onControlChange = (data, reportType) => {
		const params = this.getControlChangedParams({ ...data, reportType });
		const { selectedMetrics, selectedCharts } = data;
		const { selectedCharts: charts } = data;
		// eslint-disable-next-line no-shadow
		const { displayHBCharts } = this.state;

		const updatedChartList = displayHBCharts.map(item => {
			// eslint-disable-next-line no-param-reassign
			item.visible = charts.indexOf(item.value) !== -1;
			return item;
		});

		this.setState({
			...data,
			...params,
			reportType,
			selectedMetrics,
			displayHBCharts: updatedChartList,
			selectedCharts
		});
	};

	getDemoUserParams = () => {
		const {
			user: {
				data: { email }
			}
		} = this.props;
		const { reportType } = this.state;
		const computedObject = { email, reportType };

		return computedObject;
	};

	getControlChangedParams = (controlParams, metricsList) => {
		const { selectedDimension, selectedFilters, reportType } = controlParams;
		const { hbAnalyticsMeta } = this.props;
		const { dimension: dimensionList, filter: filterList } = hbAnalyticsMeta.data;
		let disabledFilter = [];
		let disabledDimension = [];
		let disabledMetrics = [];
		const dimensionObj = dimensionList[selectedDimension];

		if (dimensionObj) {
			disabledFilter = dimensionObj.disabled_filter || disabledFilter;
			disabledDimension = dimensionObj.disabled_dimension || disabledDimension;
			disabledMetrics = dimensionObj.disabled_metrics || disabledMetrics;
		}

		Object.keys(selectedFilters).forEach(selectedFilter => {
			const filterObj = filterList[selectedFilter];
			if (filterObj && !isEmpty(selectedFilters[selectedFilter])) {
				disabledFilter = union(filterObj.disabled_filter, disabledFilter);
				disabledDimension = union(filterObj.disabled_dimension, disabledDimension);
				disabledMetrics = union(filterObj.disabled_metrics, disabledMetrics);
			}
		});

		const updatedControlList = this.disableControl(
			disabledFilter,
			disabledDimension,
			disabledMetrics,
			metricsList,
			reportType
		);

		return {
			dimensionList: updatedControlList.updatedDimensionList,
			filterList: updatedControlList.updatedFilterList,
			metricsList: updatedControlList.metricsList
		};
	};

	formateReportParams = () => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			metricsList
		} = this.state;
		const { userSites, isCustomizeChartLegend, defaultReportType } = this.props;
		const { email, reportType } = this.getDemoUserParams();
		let selectedMetrics;

		if (metricsList && !isCustomizeChartLegend) {
			selectedMetrics = displayHBMetrics.map(metric => metric.value);
		}

		if (metricsList && isCustomizeChartLegend) {
			selectedMetrics = metricsList
				.filter(metric => !metric.isDisabled)
				.map(metric => metric.value);
		}

		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD'),
			interval: selectedInterval,
			dimension: selectedDimension
		};

		if (!isCustomizeChartLegend) {
			params.metrics = selectedMetrics ? selectedMetrics.toString() : '';
		}

		Object.keys(selectedFilters).forEach(filter => {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		});

		if (!params.siteid) {
			const siteIds = Object.keys(userSites);
			params.siteid = siteIds.toString();
		}

		if (reportType === 'global' || defaultReportType === 'global') {
			params.isSuperUser = true;
		}

		if (reportType === 'global') {
			params.siteid = '';
		}

		if (reportType === 'account') {
			params.siteid = getReportingDemoUserSiteIds(params.siteid, email, reportType);
		}

		return params;
	};

	domainFromUrl = url => {
		const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im);
		if (match) {
			return match[1];
		}
		return url;
	};

	allItemsInLocalStorage = () => {
		const archive = {};
		const keys = Object.keys(localStorage);

		keys.map(key => {
			archive[key] = localStorage.getItem(key);
		});

		return archive;
	};

	removeAllItemsInLocalStorage = () => {
		const keys = Object.keys(localStorage);
		keys.map(key => {
			localStorage.removeItem(key);
		});
	};

	generateBidCPMStatsChart = (bidCPMStatsChartData, isDefaultBucketEnabled) => {
		const { startDate, endDate, selectedInterval } = this.state;
		const { userSites } = this.props;
		const DEFAULT_BUCKET_SIZE = 0.05;
		const bucketSize = isDefaultBucketEnabled ? DEFAULT_BUCKET_SIZE : 0.01;

		let siteIds = Object.keys(userSites);
		siteIds = siteIds.toString();

		// check cache for particular bucket size
		// in that we will have data with calculation based on bucket
		const dataFromCache = localStorage.getItem(`${selectedInterval}-${startDate}-${endDate}-${siteIds}:${bucketSize}`);
		if (dataFromCache) {
			return JSON.parse(dataFromCache).cacheData || [];
		}

		// it is possible that data was cached but bucket is different
		// so in this case we have to do calculations again.
		let {
			data: { result }
		} = bidCPMStatsChartData.cacheData || bidCPMStatsChartData;
		result = sortBy(result, ['cpm', 'report_date']);

		// process data - aggregate based on siteId First
		const obj = {};
		result.map(item => {
			if (!obj[item.siteid]) {
				obj[item.siteid] = {};
			}
			if (obj[item.siteid] && !obj[item.siteid][item.cpm]) {
				obj[item.siteid][item.cpm] = [];
			}
			obj[item.siteid][item.cpm].push(item);
			return item;
		});

		const xAxis = Array(...new Array(20 / bucketSize)).map((_el, i) => {
			// eslint-disable-next-line no-param-reassign
			i *= bucketSize;
			return +i.toFixed(2);
		});
		const yAxis = [];
		Object.keys(obj).map(siteId => {
			const series = {
				name: this.domainFromUrl(userSites[siteId].siteDomain),
				data: []
			};
			xAxis.map(bucketItem => {
				// let totalBidsReceived = 0;
				let totalBidsWon = 0;
				// eslint-disable-next-line no-unused-expressions
				obj[siteId][bucketItem] &&
					obj[siteId][bucketItem].map(item => {
						totalBidsWon += item.total_bids_won;
					});
				series.data.push(totalBidsWon);
			});
			yAxis.push(series);
		});

		try {
			localStorage.setItem(
				`${selectedInterval}-${startDate}-${endDate}-${siteIds}:${bucketSize}`,
				JSON.stringify({
					expiry: moment()
						.startOf('day')
						.add(2, 'days'),
					cacheData: [xAxis, yAxis]
				})
			);
		} catch (e) {
			// fires When localstorage gets full
			// you can handle error here or empty the local storage
			console.warn('Local Storage is full, clenaing up...');
			this.removeAllItemsInLocalStorage();
			console.warn('Local Storage is available now.');
		}
		return [xAxis, yAxis];
	};

	generateButtonHandler = (inputState = {}) => {
		let { tableData } = this.state;
		// eslint-disable-next-line no-shadow
		const {
			selectedDimension,
			selectedFilters,
			dimensionList,
			displayHBMetrics,
			isDefaultBucketEnabled,
			selectedInterval,
			prevGraphData
		} = this.state;
		const { reportType, isForOps } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);

		this.setState(computedState, () => {
			let newState = {};
			const params = this.formateReportParams();
			let chartData = [];

			const { fromDate, toDate, siteid } = params;
			const DEFAULT_BUCKET_SIZE = 0.05;
			const bucketSize = isDefaultBucketEnabled ? DEFAULT_BUCKET_SIZE : 0.01;
			const allItems = this.allItemsInLocalStorage();

			Object.keys(allItems).map(item => {
				try {
					const parsedItem = JSON.parse(allItems[item]);
					if (parsedItem && parsedItem.expiry) {
						const toBeExpiredAfter = +new Date(parsedItem.expiry);
						if (toBeExpiredAfter < Date.now()) {
							localStorage.removeItem(item);
						}
					}
				} catch (e) {
					this.removeAllItemsInLocalStorage();
					console.warn(e)
				}
			});

			const dataFromCache = localStorage.getItem(`${selectedInterval}-${fromDate}-${toDate}-${siteid}:${bucketSize}`);
			const { showNotification } = this.props;

			let cacheKey = `${selectedInterval}-${fromDate}-${toDate}-${JSON.stringify(selectedFilters)}`
			let cacheDataForGraph = prevGraphData[cacheKey];
			Promise.all([
				dataFromCache
					? JSON.parse(dataFromCache).cacheData || []
					: hbAnalyticService.getBidCPMStatsGraphData({
							fromDate,
							toDate,
							siteid
					  }),
				hbAnalyticService.getCustomStats({
					...params
				}),
				cacheDataForGraph ? Promise.resolve(cacheDataForGraph): hbAnalyticService.getCustomStats({
					...params,
					dimension: 'network'
				})
			])
				.then(([responseBidCPMChartData, response, responseCharts]) => {
					if(!cacheDataForGraph) {
						prevGraphData[cacheKey] = {...responseCharts};
					}
					const [xAxis, yAxis] = dataFromCache
						? responseBidCPMChartData
						: this.generateBidCPMStatsChart(responseBidCPMChartData, isDefaultBucketEnabled);

					if (dataFromCache) {
						// eslint-disable-next-line no-param-reassign
						responseBidCPMChartData = JSON.parse(
							localStorage.getItem(`raw-${selectedInterval}-${fromDate}-${toDate}-${siteid}:${bucketSize}`) || '{}'
						);
					} else {
						try {
							// cache raw data for in future processing
							localStorage.setItem(
								`raw-${selectedInterval}-${fromDate}-${toDate}-${siteid}:${bucketSize}`,
								JSON.stringify({
									expiry: moment()
										.startOf('day')
										.add(2, 'days'),
									cacheData: responseBidCPMChartData
								})
							);
						} catch (e) {
							// fires When localstorage gets full
							// you can handle error here or empty the local storage
							console.warn('Local Storage is full, clenaing up...');
							this.removeAllItemsInLocalStorage();
							console.warn('Local Storage is available now.');
						}
					}

					if (Number(response.status) === 200 && response.data) {
						chartData = responseCharts.data.result || [];
						tableData = response.data;

						MUST_HAVE_COLS.map(col => {
							if (!tableData.columns.includes(col)) {
								tableData.columns.push(col);
							}
						});

						tableData.result = (tableData.result || []).map(item => {
							if (item.topCountries && item.topDevices) {
								item.country = [...item.topCountries];
								item.device_type = [...item.topDevices];
								if (MUST_HAVE_COLS.includes(selectedDimension)) {
									// dont' mutate the orig array
									const entity = [...item[selectedDimension]].shift();
									item.selectedDimensionColumn = entity[selectedDimension];
								}
							}
							return item;
						});

						const shouldAddAdpushupCountPercentColumn =
							(selectedDimension === 'mode' ||
								selectedDimension === 'error_code' ||
								selectedFilters.mode ||
								selectedFilters.error_code) &&
							tableData.columns.indexOf('adpushup_count') !== -1;

						// Add columns
						if (isForOps && shouldAddAdpushupCountPercentColumn) {
							tableData.columns.push('adpushup_count_percent');

							// eslint-disable-next-line no-inner-declarations
							function getComputedIntervalKey(row) {
								const { date, month, year } = row;

								if (date) return date;
								if (month && year) return `${month}-${year}`;
								return 'cumulative';
							}

							const adpushupCountTotalObj = tableData.result.reduce((totalObj, row) => {
								const { adpushup_count: adpushupCount } = row;
								const key = getComputedIntervalKey(row);

								if (Number.isInteger(totalObj[key])) {
									// eslint-disable-next-line no-param-reassign
									totalObj[key] += adpushupCount;
								} else {
									// eslint-disable-next-line no-param-reassign
									totalObj[key] = adpushupCount;
								}

								return totalObj;
							}, {});

							tableData.result.forEach(row => {
								const key = getComputedIntervalKey(row);

								const perc = (row.adpushup_count / adpushupCountTotalObj[key]) * 100;
								// eslint-disable-next-line no-param-reassign
								row.adpushup_count_percent = perc;
							});
						}

						// Compute data table total
						if (
							reportType === 'global' &&
							!tableData.total &&
							tableData.columns &&
							tableData.columns.length
						) {
							tableData.total = this.computeTotal(tableData.result);
						}

						tableData.result.forEach(row => {
							Object.keys(row).forEach(column => {
								if (
									REPORT_INTERVAL_TABLE_KEYS.indexOf(column) === -1 &&
									extraMetricsListMappingForHBArray.indexOf(column) === -1 &&
									!Number.isNaN(row[column]) &&
									// eslint-disable-next-line no-shadow
									!dimensionList.find(dimension => dimension.value === column)
								) {
									// eslint-disable-next-line no-param-reassign
									row[column] = parseFloat(roundOffTwoDecimal(row[column]));
								}
							});
						});

						Object.keys(tableData.total || {}).forEach(column => {
							tableData.total[column] = parseFloat(roundOffTwoDecimal(tableData.total[column]));
						});

						if (tableData.columns && tableData.columns.length) {
							let metricsList = this.getMetricsList(tableData);

							// device and country are not by default a metrics
							// and as per requirement default selected dimension is bidder
							// but we need to show country, devices data all the time regardless of
							// selected dimension/metrics
							metricsList = [...metricsList, ...extraMetricsListForHB];

							// this is for metrics dropdown
							// show only metrices that are in displayHBMetricsList
							const metricNameList = displayHBMetrics.map(metrics => metrics.value);
							metricsList = metricsList.filter(metrics => metricNameList.includes(metrics.value));

							newState = { ...newState, metricsList };
						}
					}

					newState = {
						...newState,
						isLoading: false,
						tableData,
						chartData,
						bidCPMStatsChartData: {
							xAxis,
							yAxis,
							label: 'Bid Landscape'
						},
						responseBidCPMChartData,
						prevGraphData: {...prevGraphData}
					};
					// don't set state here, as we also need to update charts
					this.getChartsData(newState);
				})
				.catch(err => {
					// eslint-disable-next-line no-console
					console.log(err);
					showNotification({
						mode: 'error',
						title: 'Error',
						message: 'Network Request Failed'
					});
				}); // TypeError: failed to fetch (the text may vary)
		});
	};

	getSortedMetaMetrics = metaMetrics => {
		const metaMetricsArray = Object.keys(metaMetrics).map(value => {
			// eslint-disable-next-line camelcase
			const { display_name: name, chart_position, valueType } = metaMetrics[value];

			return {
				name,
				value,
				valueType,
				chart_position
			};
		});
		return sortBy(metaMetricsArray, ['chart_position']);
	};

	/**
	 * Get first 5 metrics from report data
	 * - remove dimensions and intervals from report columns
	 * - remove unselectable items (given in meta)
	 * - sort by chart position (given in meta)
	 * - pick first 5
	 * @memberof Report
	 */
	getMetricsList = tableData => {
		const { hbAnalyticsMeta } = this.props;

		const filteredMetrics = tableData.columns.filter(metric => {
			const isDimension = !!hbAnalyticsMeta.data.dimension[metric];
			const isBlacklistedMetric = REPORT_INTERVAL_TABLE_KEYS.indexOf(metric) !== -1;
			const isSelectableMetric =
				hbAnalyticsMeta.data.metrics[metric] && hbAnalyticsMeta.data.metrics[metric].selectable;

			return !isDimension && !isBlacklistedMetric && isSelectableMetric;
		});

		const sortedMetaMetrics = this.getSortedMetaMetrics(hbAnalyticsMeta.data.metrics);

		const computedMetrics = [];

		sortedMetaMetrics.forEach(metaMetric => {
			const { name, value, valueType } = metaMetric;
			if (filteredMetrics.indexOf(value) !== -1) computedMetrics.push({ name, value, valueType });
		});
		// computedMetrics.splice(5);

		return computedMetrics;
	};

	computeTotal = tableRows => {
		const { dimensionList } = this.state;
		const total = tableRows.reduce((totalAccumulator, tableRow) => {
			const totalCopy = { ...totalAccumulator };

			if (tableRow && typeof tableRow === 'object' && Object.keys(tableRow).length) {
				// eslint-disable-next-line no-restricted-syntax
				for (const column in tableRow) {
					if (
						REPORT_INTERVAL_TABLE_KEYS.indexOf(column) === -1 &&
						!Number.isNaN(tableRow[column]) &&
						!dimensionList.find(dimension => dimension.value === column)
					) {
						if (columnsBlacklistedForAddition.indexOf(column) !== -1) {
							totalCopy[`total_${column}`] = 0;
						} else {
							totalCopy[`total_${column}`] = totalCopy[`total_${column}`]
								? totalCopy[`total_${column}`] + tableRow[column]
								: tableRow[column];
						}
					}
				}
			}

			return totalCopy;
		}, {});

		if (
			total.hasOwnProperty('total_network_net_revenue') &&
			total.hasOwnProperty('total_adpushup_impressions')
		) {
			if (total.hasOwnProperty('total_adpushup_ad_ecpm')) {
				total.total_adpushup_ad_ecpm =
					(total.total_network_net_revenue / total.total_adpushup_impressions) * 1000;
			}

			if (total.hasOwnProperty('total_network_ad_ecpm')) {
				total.total_network_ad_ecpm =
					(total.total_network_net_revenue / total.total_network_impressions) * 1000;
			}
		}

		if (
			total.hasOwnProperty('total_adpushup_page_cpm') &&
			total.hasOwnProperty('total_network_net_revenue') &&
			total.hasOwnProperty('total_adpushup_page_views')
		) {
			total.total_adpushup_page_cpm =
				(total.total_network_net_revenue / total.total_adpushup_page_views) * 1000;
		}

		if (
			total.hasOwnProperty('total_adpushup_xpath_miss_percent') &&
			total.hasOwnProperty('total_adpushup_xpath_miss') &&
			total.hasOwnProperty('total_adpushup_impressions')
		) {
			total.total_adpushup_xpath_miss_percent = (
				(total.total_adpushup_xpath_miss /
					(total.total_adpushup_xpath_miss + total.total_adpushup_impressions)) *
				100
			).toFixed(2);
		}

		if (total.hasOwnProperty('total_adpushup_count_percent')) {
			delete total.total_adpushup_count_percent;
		}

		return total;
	};

	updateMetrics = (newMetrics = []) => {
		const { hbAnalyticsMeta } = this.props;
		const sortedMetaMetrics = this.getSortedMetaMetrics(hbAnalyticsMeta.data.metrics);
		const sortedMetrics = [];

		sortedMetaMetrics.forEach(metaMetric => {
			const foundMetric = newMetrics.find(newMetric => newMetric.value === metaMetric.value);

			if (foundMetric) sortedMetrics.push(foundMetric);
		});

		this.setState({ metricsList: sortedMetrics });
	};

	getCsvData = csvData => {
		this.setState({ csvData });
	};

	renderEmptyMessage = msg => <Empty message={msg} />;

	getContentInfo = hbAnalyticsMetaData => {
		let {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			selectedChartLegendMetric,
			reportType,
			startDate,
			endDate
		} = this.state;
		// eslint-disable-next-line no-shadow
		const { displayHBCharts } = this.state;

		const _displayHBCharts = JSON.parse(JSON.stringify(displayHBCharts));
		const selectedCharts = _displayHBCharts.filter(item => item.visible).map(item => item.value);

		const {
			match: {
				params: { siteId }
			},
			location: { search: queryParams },
			userSites
		} = this.props;
		const { email } = this.getDemoUserParams();
		const { site: reportingSites, interval: intervalsObj } = hbAnalyticsMetaData;
		const selectedControls = qs.parse(queryParams);
		const isValidSite = !!(userSites && userSites[siteId] && userSites[siteId].siteDomain);
		const isReportingData = !!reportingSites;
		const { isValid } = getReportingDemoUserValidation(email, reportType);
		const {
			DEFAULT_SITE: { SITE_ID }
		} = DEMO_ACCOUNT_DATA;
		const isDemoUserReportingSite = !!(isValid && isReportingData && reportingSites[SITE_ID]);
		const isReportingSite = !!(
			isReportingData &&
			(reportingSites[siteId] || isDemoUserReportingSite)
		);
		const computedSiteId = isDemoUserReportingSite ? SITE_ID : siteId;

		if (siteId) {
			reportType = 'site';
			if ((isValidSite || isDemoUserReportingSite) && isReportingSite) {
				selectedFilters = { siteid: { [computedSiteId]: true } };
			}
			selectedFilters = { siteid: { [siteId]: true } };
		}

		if (Object.keys(selectedControls).length > 0) {
			const { dimension, interval, fromDate, toDate, chartLegendMetric } = selectedControls;
			selectedDimension = dimension;
			selectedInterval = interval || 'daily';
			selectedChartLegendMetric = chartLegendMetric;
			startDate = fromDate;
			endDate = toDate;
		}

		const { dimensionList, filterList, metricsList } = this.getControlChangedParams({
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedFilters,
			reportType
		});
		const intervalList = convertObjToArr(intervalsObj);

		this.setState(
			{
				startDate,
				endDate,
				selectedInterval,
				selectedDimension,
				selectedFilters,
				selectedChartLegendMetric,
				reportType,
				dimensionList,
				filterList,
				metricsList,
				intervalList,
				selectedCharts
			},
			this.generateButtonHandler
		);
	};

	getChartsData = newState => {
		// eslint-disable-next-line no-shadow
		const { displayHBCharts, selectedDimension } = this.state;
		let _displayHBCharts = JSON.parse(JSON.stringify(displayHBCharts));

		const dimensionWiseData = {};
		newState.chartData.map(item => {
			if (!dimensionWiseData[item[PIVOT]]) {
				dimensionWiseData[item[PIVOT]] = [];
			}
			dimensionWiseData[item[PIVOT]].push(item);
			return item;
		});

		_displayHBCharts = _displayHBCharts.map(chart => {
			const chartData = {};
			if (chart.type === 'pie') {
				// eslint-disable-next-line array-callback-return
				Object.keys(dimensionWiseData).map(key => {
					if (!chartData[key]) {
						chartData[key] = { prebid_bid_win: 0 };
					}
					// eslint-disable-next-line array-callback-return
					dimensionWiseData[key].map(item => {
						// check for if HB Analytics is enbaled or not
						// iif not then prebid_bid_requests would be 0
						if (item.prebid_bid_requests) {
							chartData[key].name = key;
							chartData[key].prebid_bid_win += item.prebid_bid_win;
						}
					});
				});
				// get total of prebid_bid_win
				let totalWin = 0;
				// eslint-disable-next-line array-callback-return
				Object.keys(chartData).map(each => {
					totalWin += chartData[each].prebid_bid_win;
				});
				// percentage of pre bid win for each Bidder as per total prebid win
				Object.keys(chartData).map(each => {
					chartData[each].overAllPer =
						((totalWin && chartData[each].prebid_bid_win / totalWin) || 0) * 100;
				});

				// now our data is ready to be feed in a Pie chart
				// eslint-disable-next-line no-param-reassign
				chart.data = Object.keys(chartData).map(key => ({
					name: chartData[key].name,
					y: chartData[key].overAllPer,
					sliced: true
				}));
				// some names ar undefined may be becasue there values are zero
				// or they have special chars in their name.
				// eslint-disable-next-line no-param-reassign
				chart.data = chart.data.filter(item => item.name);
				// eslint-disable-next-line no-param-reassign
				chart.data = sortBy(chart.data, ['y'], ['asc']).reverse();
			} else {
				const { eCPM, RESPONSE_TIME, PERCENT } = ANOMALY_THRESHOLD_CONSTANT;
				Object.keys(dimensionWiseData).map(key => {
					chartData[key] = dimensionWiseData[key].map(item => {
						switch(chart.value) {
							case "prebid_win_ecpm":
							case "overall_win_ecpm":
								return {
									date: item.date,
									value: item[chart.value] > ANOMALY_THRESHOLD_CONSTANT.eCPM?ANOMALY_THRESHOLD_CONSTANT.eCPM: Number(item[chart.value].toFixed(2)) || 0
								};	  
							  break;
							case "average_response_time":
								return {
									date: item.date,
									value: item[chart.value] > ANOMALY_THRESHOLD_CONSTANT.RESPONSE_TIME?ANOMALY_THRESHOLD_CONSTANT.RESPONSE_TIME : Number(item[chart.value].toFixed(2)) || 0
								};	  
								break;
							case "overall_win_percent":
								return {
									date: item.date,
									value: item[chart.value] > ANOMALY_THRESHOLD_CONSTANT.PERCENT ? ANOMALY_THRESHOLD_CONSTANT.PERCENT: Number(item[chart.value].toFixed(2)) || 0
								};	  
								break;
							default:
							  return {
								  date: item.date,
								  value: Number(item[chart.value].toFixed(2)) || 0
							  };
						}

					});
					chartData[key] = sortBy(chartData[key], ['date']);
				});
				// eslint-disable-next-line no-param-reassign
				chart.data = chartData;
			}
			return chart;
		});

		this.setState({
			...newState,
			chartData: [..._displayHBCharts]
		});
	};

	getAllAvailableMetrics = (
		isCustomizeChartLegend,
		hbAnalyticsMeta,
		selectedDimension,
		selectedFilters,
		reportType,
		tableData
	) => {
		let allAvailableMetrics = [];
		if (
			isCustomizeChartLegend &&
			hbAnalyticsMeta &&
			hbAnalyticsMeta.data &&
			hbAnalyticsMeta.data.metrics &&
			typeof hbAnalyticsMeta.data.metrics === 'object' &&
			Object.keys(hbAnalyticsMeta.data.metrics).length &&
			tableData &&
			tableData.result &&
			tableData.result.length
		) {
			const allAvailableMetricsArr = Object.keys(hbAnalyticsMeta.data.metrics)
				.filter(key => hbAnalyticsMeta.data.metrics[key].selectable)
				.map(key => {
					const { display_name: name, valueType } = hbAnalyticsMeta.data.metrics[key];
					return {
						name,
						value: key,
						valueType,
						isDisabled: !tableData.result.find(tableRow => tableRow.hasOwnProperty(key))
					};
				});

			allAvailableMetrics = allAvailableMetricsArr;
		}

		return allAvailableMetrics;
	};

	filterTableDataBySelectedMetrics = (tableData, metricsList, dimensionList) => {
		const selectedMetricsTableData = tableData;
		const { selectedDimension } = this.state;

		const { selectedMetrics } = this.state;
		const metricNameList = selectedMetrics;
		const filteredMetricsList = metricsList.filter(metrics =>
			metricNameList.includes(metrics.value)
		);

		selectedMetricsTableData.columns = selectedMetricsTableData.columns.filter(column => {
			if (selectedDimension !== PIVOT && column === PIVOT) {
				return false;
			}

			// check for country and device as metrics only.
			// the issue here is these are also available in dimension
			// and condition gets truthy even if ther are not selected as metrics
			if (extraMetricsListForHB.map(item => item.value).includes(column)) {
				return !!filteredMetricsList.find(metric => metric.value === column);
			}
			return (
				!!filteredMetricsList.find(metric => metric.value === column) ||
				REPORT_INTERVAL_TABLE_KEYS.indexOf(column) !== -1 ||
				!!dimensionList.find(dimension => dimension.value === column)
			);
		});

		selectedMetricsTableData.result = selectedMetricsTableData.result.map(row => {
			const computedRow = { ...row };

			// eslint-disable-next-line no-restricted-syntax
			for (const key in computedRow) {
				if (
					!filteredMetricsList.find(metric => metric.value === key) &&
					REPORT_INTERVAL_TABLE_KEYS.indexOf(key) === -1 &&
					!dimensionList.find(dimension => dimension.value === key)
				) {
					// delete computedRow[key];
				}
			}

			return computedRow;
		});

		if (extraMetricsListMappingForHBArray.includes(selectedDimension)) {
			selectedMetricsTableData.columns.push('selectedDimensionColumn');
		}

		const computedTotal = { ...selectedMetricsTableData.total };

		// eslint-disable-next-line no-restricted-syntax
		for (const key in computedTotal) {
			if (!filteredMetricsList.find(metric => `total_${metric.value}` === key)) {
				delete computedTotal[key];
			}
		}

		selectedMetricsTableData.total = computedTotal;
		return selectedMetricsTableData;
	};

	handleDismiss = () => {
		this.setState({ show: false });
	};

	handleToggle = () => {
		const { isDefaultBucketEnabled, responseBidCPMChartData } = this.state;
		const [xAxis, yAxis] = this.generateBidCPMStatsChart(
			responseBidCPMChartData,
			!isDefaultBucketEnabled
		);
		this.setState({
			bidCPMStatsChartData: {
				xAxis,
				yAxis,
				label: 'Bid Landscape'
			},
			isDefaultBucketEnabled: !isDefaultBucketEnabled
		});
	};

	aggregateValues(result = []) {
		const modifiedResult = [];
		const { selectedInterval, startDate, endDate } = this.state;

		result.forEach(row => {
			const tableRow = { ...row };

			if (selectedInterval === 'daily') tableRow.date = tableRow.date;

			if (selectedInterval === 'monthly' && tableRow.month) {
				let monthlyDateRangeStart;
				let monthlyDateRangeEnd;

				// Compute monthlyDateRangeStart
				if (`${tableRow.year}-${tableRow.month}` === moment(startDate).format('Y-M')) {
					monthlyDateRangeStart = moment(startDate).format('ll');
				} else {
					monthlyDateRangeStart = moment()
						.month(tableRow.month - 1) // moment accepts 0-11 months
						.year(tableRow.year)
						.startOf('month')
						.format('ll');
				}

				// Compute monthlyDateRangeEnd
				if (`${tableRow.year}-${tableRow.month}` === moment(endDate).format('Y-M')) {
					monthlyDateRangeEnd = moment(endDate).format('ll');
				} else {
					monthlyDateRangeEnd = moment()
						.month(tableRow.month - 1) // moment accepts 0-11 months
						.year(tableRow.year)
						.endOf('month')
						.format('ll');
				}

				tableRow.date = `${monthlyDateRangeStart} to ${monthlyDateRangeEnd}`;
			}

			if (selectedInterval === 'cumulative')
				tableRow.date = `${moment(startDate).format('ll')} to ${moment(endDate).format('ll')}`;

			modifiedResult.push(tableRow);
		});

		const groupedData = mapValues(groupBy(modifiedResult, 'date'), reportData =>
			reportData.map(data => omit(data, 'date'))
		);

		return groupedData;
	}

	renderContent = () => {
		const {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			selectedMetrics,
			selectedCharts,
			reportType,
			startDate,
			endDate,
			csvData,
			isValidSite,
			isReportingSite,
			dimensionList,
			intervalList,
			metricsList,
			filterList,
			tableData,
			// eslint-disable-next-line no-shadow
			displayHBCharts,
			chartData,
			bidCPMStatsChartData,
			isDefaultBucketEnabled
		} = this.state;
		const {
			hbAnalyticsMeta,
			reportType: defaultReportType,
			isCustomizeChartLegend,
			isForOps,
			userSites,
			user,
			showNotification
		} = this.props;

		const allAvailableMetrics = this.getAllAvailableMetrics(
			isCustomizeChartLegend,
			hbAnalyticsMeta,
			selectedDimension,
			selectedFilters,
			reportType,
			tableData
		);

		const aggregatedData = this.aggregateValues(tableData.result);
		const { email } = this.getDemoUserParams();
		const { isValid } = getReportingDemoUserValidation(email, reportType);

		if (reportType === 'site') {
			if (!isValidSite)
				return this.renderEmptyMessage(
					'Seems like you have entered an invalid siteid in url. Please check.'
				);
			if (!isReportingSite) return this.renderEmptyMessage('No Data Available');
		}

		let selectedMetricsTableData = JSON.parse(JSON.stringify(tableData));

		if (isCustomizeChartLegend && tableData.result && tableData.result.length) {
			selectedMetricsTableData = this.filterTableDataBySelectedMetrics(
				selectedMetricsTableData,
				metricsList,
				dimensionList
			);
		}

		return (
			<Row>
				<Col sm={12}>
					<ControlContainer
						isHB
						startDate={startDate}
						endDate={endDate}
						generateButtonHandler={this.generateButtonHandler}
						onControlChange={this.onControlChange}
						dimensionList={dimensionList}
						filterList={filterList}
						intervalList={intervalList}
						metricsList={metricsList}
						displayHBMetrics={displayHBMetrics}
						displayHBCharts={displayHBCharts}
						selectedDimension={selectedDimension}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
						selectedCharts={selectedCharts}
						selectedInterval={selectedInterval}
						reportType={reportType}
						defaultReportType={defaultReportType}
						isForOps={isForOps}
						csvData={csvData}
						isDemoUser={isValid}
						userSites={userSites}
						user={user}
						showNotification={showNotification}
					/>
				</Col>
				{chartData.map((chart, index) =>
					selectedCharts.indexOf(chart.value) !== -1 ? (
						<Col sm={12} className="u-margin-t5">
							<ChartContainer
								// eslint-disable-next-line react/no-array-index-key
								key={index}
								isHB
								chartDetails={chart}
								chartData={chart.data || []}
								startDate={startDate}
								endDate={endDate}
								reportType={reportType}
								selectedInterval={selectedInterval}
							/>
						</Col>
					) : (
						''
					)
				)}
				<Col sm={12} className="u-margin-t5 bidLandscapeTitleWrapper">
					<h3 />
					<h3>Bid Landscape</h3>
					<CustomToggle
						css="toggleWrapper"
						label={`Bucket Size: ${isDefaultBucketEnabled ? 0.05 : 0.01}`}
						selectedItem={isDefaultBucketEnabled ? 0.05 : 0.01}
						handleToggle={this.handleToggle}
						options={[0.05, 0.01]}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5">
					<BidCPMStatChartContainer
						// isHB
						chartDetails={{
							name: 'Bid Landscape',
							caption: ''
						}}
						chartData={bidCPMStatsChartData}
						startDate={startDate}
						endDate={endDate}
						reportType={reportType}
						selectedInterval={selectedInterval}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5 u-margin-b4">
					{selectedMetricsTableData.result && selectedMetricsTableData.result.length ? (
						<TableContainer
							isHB
							tableData={selectedMetricsTableData}
							aggregatedData={aggregatedData}
							startDate={startDate}
							endDate={endDate}
							selectedInterval={selectedInterval}
							selectedDimension={selectedDimension}
							getCsvData={this.getCsvData}
							reportType={reportType}
							defaultReportType={defaultReportType}
							isForOps={isForOps}
						/>
					) : (
						<div className="noDataRow">
							<span>No Data found</span>
						</div>
					)}
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading, show } = this.state;
		const { hbAnalyticsMeta } = this.props;

		if (!hbAnalyticsMeta.fetched || isLoading) {
			return <Loader />;
		}

		return (
			<React.Fragment>
				<ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>
				{show ? (
					<Alert bsStyle="info" onDismiss={this.handleDismiss} className="u-margin-t4">
						For old reporting data <strong>(before 1st August, 2019)</strong> go to old console by{' '}
						<a
							target="_blank"
							onClick={oldConsoleRedirection}
							className="u-link-reset"
							style={{ cursor: 'pointer' }}
						>
							<strong>clicking here.</strong>
						</a>
					</Alert>
				) : null}
			</React.Fragment>
		);
	}
}

export default Report;
