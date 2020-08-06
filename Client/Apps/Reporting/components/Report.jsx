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
import ChartContainer from '../containers/ChartContainer';
import reportService from '../../../services/reportService';
import { DEMO_ACCOUNT_DATA } from '../../../constants/others';
import Loader from '../../../Components/Loader';
import { convertObjToArr, roundOffTwoDecimal } from '../helpers/utils';
import {
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites
} from '../../../helpers/commonFunctions';
import {
	displayMetrics,
	displayOpsMetrics,
	displayUniqueImpressionMetrics,
	opsDimension,
	opsFilter,
	REPORT_INTERVAL_TABLE_KEYS,
	columnsBlacklistedForAddition
} from '../configs/commonConsts';

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
		this.state = {
			dimensionList: [],
			filterList: [],
			intervalList: [],
			metricsList: props.isForOps ? displayOpsMetrics : displayMetrics,
			selectedDimension: '',
			selectedFilters: {},
			selectedMetrics: [],
			selectedInterval: 'daily',
			selectedChartLegendMetric: '',
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
			show: true
		};
	}

	componentDidMount() {
		const { userSites, updateReportMetaData, reportsMeta, isForOps } = this.props;
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

		const params = { sites: userSitesStr };
		// eslint-disable-next-line no-unused-expressions
		isSuperUser ? (params.isSuperUser = isSuperUser) : null;

		if (!reportsMeta.fetched) {
			return reportService.getMetaData(params).then(response => {
				let { data: computedData } = response;

				computedData = getDemoUserSites(computedData, email);
				updateReportMetaData(computedData);
				return this.getContentInfo(computedData);
			});
		}

		return this.getContentInfo(reportsMeta.data);
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
			reportsMeta,
			user: {
				data: { isSuperUser }
			}
		} = this.props;

		const { dimension: dimensionListObj, filter: filterListObj } = reportsMeta.data;
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

		this.setState({
			...data,
			...params,
			reportType
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
		const { reportsMeta } = this.props;
		const { dimension: dimensionList, filter: filterList } = reportsMeta.data;
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

		if (metricsList) {
			selectedMetrics = displayMetrics.map(metric => metric.value);
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
			dimension: selectedDimension || null
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

	generateButtonHandler = (inputState = {}) => {
		let { tableData, metricsList } = this.state;
		const { selectedDimension, selectedFilters, dimensionList } = this.state;
		const { reportType, isForOps } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);
		const prevMetricsList = metricsList;

		this.setState(computedState, () => {
			let newState = {};
			const params = this.formateReportParams();

			reportService.getCustomStats(params).then(response => {
				if (Number(response.status) === 200 && response.data) {
					tableData = response.data;

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
								!Number.isNaN(row[column]) &&
								!dimensionList.find(dimension => dimension.value === column) &&
								column !== 'site'
							) {
								// eslint-disable-next-line no-param-reassign
								row[column] = parseFloat(roundOffTwoDecimal(row[column]));
							}
						});
					});

					Object.keys(tableData.total).forEach(column => {
						tableData.total[column] = parseFloat(roundOffTwoDecimal(tableData.total[column]));
					});

					if (tableData.columns && tableData.columns.length) {
						metricsList = this.getMetricsList(tableData);
						// we need to persist user column selection when user
						// generates report multiple times.
						// for that we will check users previous selection, if it
						// is different from default list override default wit
						// previous values
						if (isForOps && prevMetricsList.length !== metricsList.length) {
							metricsList = [...prevMetricsList];
						} else if (isForOps) {
							// for same length we need to check for individual value
							const listPrevColList = prevMetricsList
								.map(item => item.value)
								.sort()
								.join();
							const defaultPrevColList = metricsList
								.map(item => item.value)
								.sort()
								.join();
							if (listPrevColList !== defaultPrevColList) {
								metricsList = [...prevMetricsList];
							}
						}
						newState = { ...newState, metricsList };
					}
				}

				newState = { ...newState, isLoading: false, tableData };
				this.setState(newState);
			});
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
	 * @memberof Panel
	 */
	getMetricsList = tableData => {
		const {
			reportsMeta,
			isForOps,
			user: {
				data: { isUniqueImpEnabled = false }
			}
		} = this.props;
		const filteredMetrics = tableData.columns.filter(metric => {
			const isDimension = !!reportsMeta.data.dimension[metric];
			const isBlacklistedMetric = REPORT_INTERVAL_TABLE_KEYS.indexOf(metric) !== -1;
			const isSelectableMetric =
				reportsMeta.data.metrics[metric] && reportsMeta.data.metrics[metric].selectable;

			return !isDimension && !isBlacklistedMetric && isSelectableMetric;
		});

		const sortedMetaMetrics = this.getSortedMetaMetrics(reportsMeta.data.metrics);

		let computedMetrics = [];

		sortedMetaMetrics.forEach(metaMetric => {
			const { name, value, valueType } = metaMetric;
			if (filteredMetrics.indexOf(value) !== -1) computedMetrics.push({ name, value, valueType });
		});

		let match = displayMetrics.map(item => item.value);
		if (isForOps) {
			match = displayOpsMetrics.map(item => item.value);
			computedMetrics = computedMetrics.filter(item => match.indexOf(item.value) !== -1);
		} else {
			// check if unique imp is checked
			if (isUniqueImpEnabled) {
				match = displayUniqueImpressionMetrics.map(item => item.value);
			}
			computedMetrics = computedMetrics.filter(item => match.indexOf(item.value) !== -1);
		}
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
		const { reportsMeta, isForOps, overrideOpsPanelUniqueImpValue } = this.props;
		const sortedMetaMetrics = this.getSortedMetaMetrics(reportsMeta.data.metrics);
		let sortedMetrics = [];
		if (isForOps) {
			sortedMetaMetrics.forEach(metaMetric => {
				const foundMetric = newMetrics.find(newMetric => newMetric.value === metaMetric.value);

				if (foundMetric) sortedMetrics.push(foundMetric);
			});
		} else {
			const found = newMetrics.filter(item => item.value === 'unique_impressions');
			// if unique impression selected
			if (found.length) {
				const match = displayUniqueImpressionMetrics.map(item => item.value);
				sortedMetrics = sortedMetaMetrics.filter(item => match.indexOf(item.value) !== -1);
				// temp code for unqiue imp selection in dashboard from this component
				overrideOpsPanelUniqueImpValue({ isUniqueImpEnabled: true });
			} else {
				const match = displayMetrics.map(item => item.value);
				sortedMetrics = sortedMetaMetrics.filter(item => match.indexOf(item.value) !== -1);
				// temp code for unqiue imp selection in dashboard from this component
				overrideOpsPanelUniqueImpValue({ isUniqueImpEnabled: false });
			}
		}

		this.setState({ metricsList: sortedMetrics });
	};

	getCsvData = csvData => {
		this.setState({ csvData });
	};

	renderEmptyMessage = msg => <Empty message={msg} />;

	getContentInfo = reportsMetaData => {
		let {
			selectedDimension,
			selectedFilters,
			selectedInterval,
			selectedChartLegendMetric,
			reportType,
			startDate,
			endDate
		} = this.state;
		const {
			match: {
				params: { siteId }
			},
			location: { search: queryParams },
			userSites
		} = this.props;
		const { email } = this.getDemoUserParams();
		const { site: reportingSites, interval: intervalsObj } = reportsMetaData;
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
				intervalList
			},
			this.generateButtonHandler
		);
	};

	getAllAvailableMetrics = (
		isCustomizeChartLegend,
		reportsMeta,
		selectedDimension,
		selectedFilters,
		reportType,
		tableData
	) => {
		let allAvailableMetrics = [];
		if (
			isCustomizeChartLegend &&
			reportsMeta &&
			reportsMeta.data &&
			reportsMeta.data.metrics &&
			typeof reportsMeta.data.metrics === 'object' &&
			Object.keys(reportsMeta.data.metrics).length &&
			tableData &&
			tableData.result &&
			tableData.result.length
		) {
			const allAvailableMetricsArr = Object.keys(reportsMeta.data.metrics)
				.filter(key => reportsMeta.data.metrics[key].selectable)
				.map(key => {
					const { display_name: name, valueType } = reportsMeta.data.metrics[key];
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

		selectedMetricsTableData.columns = selectedMetricsTableData.columns.filter(
			column =>
				!!metricsList.find(metric => metric.value === column) ||
				REPORT_INTERVAL_TABLE_KEYS.indexOf(column) !== -1 ||
				!!dimensionList.find(dimension => dimension.value === column)
		);

		selectedMetricsTableData.result = selectedMetricsTableData.result.map(row => {
			const computedRow = { ...row };

			// eslint-disable-next-line no-restricted-syntax
			for (const key in computedRow) {
				if (
					!metricsList.find(metric => metric.value === key) &&
					REPORT_INTERVAL_TABLE_KEYS.indexOf(key) === -1 &&
					!dimensionList.find(dimension => dimension.value === key) &&
					!computedRow.site
				) {
					delete computedRow[key];
				}
			}

			return computedRow;
		});

		const computedTotal = { ...selectedMetricsTableData.total };

		// eslint-disable-next-line no-restricted-syntax
		for (const key in computedTotal) {
			if (!metricsList.find(metric => `total_${metric.value}` === key)) {
				delete computedTotal[key];
			}
		}

		selectedMetricsTableData.total = computedTotal;

		return selectedMetricsTableData;
	};

	handleDismiss = () => {
		this.setState({ show: false });
	};

	aggregateValues(result) {
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
			selectedChartLegendMetric,
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
			tableData
		} = this.state;
		const {
			reportsMeta,
			reportType: defaultReportType,
			isCustomizeChartLegend,
			isForOps,
			userSites,
			user,
			showNotification
		} = this.props;

		let allAvailableMetrics = this.getAllAvailableMetrics(
			isCustomizeChartLegend,
			reportsMeta,
			selectedDimension,
			selectedFilters,
			reportType,
			tableData
		);

		if (!isForOps) {
			allAvailableMetrics = allAvailableMetrics
				.filter(item => item.value === 'unique_impressions')
				.map(item => {
					// eslint-disable-next-line no-param-reassign
					item.name = 'Unique Impressions Reporting';
					// eslint-disable-next-line no-param-reassign
					item.isDisabled = false;
					return item;
				});
		} else {
			// this is for ops panel reports. Don't whow unique impression items in dropdown
			allAvailableMetrics = allAvailableMetrics.filter(item => item.value.indexOf('unique') === -1);
		}
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
						startDate={startDate}
						endDate={endDate}
						generateButtonHandler={this.generateButtonHandler}
						onControlChange={this.onControlChange}
						dimensionList={dimensionList}
						filterList={filterList}
						intervalList={intervalList}
						metricsList={metricsList}
						selectedDimension={selectedDimension}
						selectedFilters={selectedFilters}
						selectedMetrics={selectedMetrics}
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
				<Col sm={12} className="u-margin-t5">
					<ChartContainer
						tableData={tableData}
						selectedDimension={selectedDimension}
						startDate={startDate}
						endDate={endDate}
						metricsList={metricsList}
						allAvailableMetrics={allAvailableMetrics}
						reportType={reportType}
						isForOps={isForOps}
						isCustomizeChartLegend={isCustomizeChartLegend}
						updateMetrics={this.updateMetrics}
						selectedInterval={selectedInterval}
						selectedChartLegendMetric={selectedChartLegendMetric}
					/>
				</Col>
				<Col sm={12} className="u-margin-t5 u-margin-b4">
					<TableContainer
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
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading, show } = this.state;
		const { reportsMeta } = this.props;

		if (!reportsMeta.fetched || isLoading) {
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