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
import ActionCard from '../../../../Components/ActionCard/index';
import Empty from '../../../../Components/Empty/index';
import ControlContainer from '../../containers/URLAndUTMContainer/ControlContainer';
import TableContainer from '../../containers/URLAndUTMContainer/TableContainer';
import urlReportService from '../../../../services/urlReportService';

import {
	displayURLMetrics,
	displayUTMMetrics,
	opsDimension,
	opsFilter,
	REPORT_INTERVAL_TABLE_KEYS,
	columnsBlacklistedForAddition
} from '../../configs/commonConsts';
import { DEMO_ACCOUNT_DATA } from '../../../../constants/others';
import Loader from '../../../../Components/Loader';
import { convertObjToArr, roundOffTwoDecimal } from '../../helpers/utils';
import {
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites
} from '../../../../helpers/commonFunctions';

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
		// let selectedMetrics = displayURLAndUTMMetrics.filter((metrics) => metrics.visible).map((metrics) => metrics.value)
		this.state = {
			dimensionList: [],
			filterList: [],
			intervalList: [],
			displayURLMetrics,
			displayUTMMetrics,
			displayURLAndUTMMetrics: displayUTMMetrics || [],
			metricsList: [],
			selectedDimension: 'url',
			selectedFilters: {},
			selectedMetrics: [],
			selectedInterval: 'cumulative',
			selectedOrder: 'top_select_criteria',
			selectedOrderBy: 'impressions',
			selectedTotalRecords: '500',
			searchFilter: '',
			pagesFetched: 0,
			pageIndex: 0,
			pageSize: 150,
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
		const { userSites, updateReportMetaData, urlUTMReportingMeta, isForOps } = this.props;
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

		if (!urlUTMReportingMeta.fetched) {
			return urlReportService
				.getMetaData({ sites: userSitesStr, isSuperUser, product: 'hb-analytics' })
				.then(response => {
					let { data: computedData } = response;
					computedData = getDemoUserSites(computedData, email);
					updateReportMetaData(computedData);
					return this.getContentInfo(computedData);
				});
		}
		return this.getContentInfo(urlUTMReportingMeta.data);
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
			urlUTMReportingMeta,
			user: {
				data: { isSuperUser }
			}
		} = this.props;

		const { dimension: dimensionListObj, filter: filterListObj } = urlUTMReportingMeta.data;
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
		const { metricsList } = this.state;
		const {
			selectedMetrics,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			regexFilter
		} = data;
		const filteredMetricsList = metricsList.filter(item => selectedMetrics.includes(item.value));

		this.setState({
			...data,
			...params,
			reportType,
			selectedMetrics,
			displayURLAndUTMMetrics: filteredMetricsList,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			searchFilter: regexFilter
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
		const { urlUTMReportingMeta } = this.props;
		const { dimension: dimensionList, filter: filterList } = urlUTMReportingMeta.data;
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
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			selectedFilters,
			selectedInterval
		} = this.state;
		const { userSites, defaultReportType, urlReportingSites } = this.props;
		const { email, reportType } = this.getDemoUserParams();

		const params = {
			fromDate: moment(startDate).format('YYYY-MM-DD'),
			toDate: moment(endDate).format('YYYY-MM-DD'),
			interval: selectedInterval,
			dimension: selectedDimension,
			[selectedOrder]: selectedOrderBy,
			page_size: selectedTotalRecords,
			page: 0
		};

		Object.keys(selectedFilters).forEach(filter => {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		});

		if (!params.siteid) {
			// multiple sites are not supported, picking first site from array
			const [siteId] = urlReportingSites;
			params.siteid = siteId;
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

	prefetchTableData = () => {
		const params = this.formateReportParams();
		delete params.dimension;
		const { pagesFetched } = this.state;
		params.page = +pagesFetched + 1;

		const { reportType } = this.props;
		urlReportService.getCustomStats({ ...params }).then(response => {
			if (Number(response.status) === 200 && response.data) {
				const data = response.data || [];
				const { tableData } = this.state;
				tableData.result = [...tableData.result, ...data.result];

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
						if (!Number.isNaN(row[column]) && !(typeof row[column] === 'string')) {
							// eslint-disable-next-line no-param-reassign
							row[column] = parseFloat(roundOffTwoDecimal(row[column]));
						}
					});
				});
				this.setState({
					isPreFetchingStarted: false,
					pagesFetched: pagesFetched + 1,
					tableData: Object.assign({}, { ...tableData })
				});
			}
		});
	};

	onPageChange = pageIndex => {
		const { pageSize, tableData, isPreFetchingStarted } = this.state;
		const totlaRecordsFetched = tableData.result.length;
		const pageCount = Math.ceil(totlaRecordsFetched / pageSize);

		// index start from 0
		if (pageCount - (pageIndex + 1) <= 1 && !isPreFetchingStarted) {
			this.setState(
				{
					pageSize,
					pageIndex,
					isPreFetchingStarted: true
				},
				() => {
					this.prefetchTableData();
				}
			);
		} else {
			this.setState({
				pageIndex
			});
		}
	};

	onPageSizeChange = (tablePageSize, pageIndex) => {
		const { tableData } = this.state;
		const totlaRecordsFetched = tableData.result.length;
		const pageCount = Math.ceil(totlaRecordsFetched / tablePageSize);

		// index start from 0
		if (pageCount - (pageIndex + 1) <= 1) {
			this.prefetchTableData();
		}
	};

	generateButtonHandler = (inputState = {}) => {
		let { tableData } = this.state;
		const { selectedDimension, selectedFilters, dimensionList } = this.state;
		const { reportType, isForOps } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);
		const isURL = selectedDimension.indexOf('url') !== -1;
		this.setState(computedState, () => {
			let newState = {};
			const params = this.formateReportParams();
			delete params.dimension;
			urlReportService.getCustomStats({ ...params }).then(response => {
				if (Number(response.status) === 200 && response.data) {
					tableData = response.data || [];
					// hide bidder/network col - data is being aggregated data wise
					tableData.columns = tableData.columns.filter(item => item !== 'network');
					tableData.total = {};
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
								!(typeof row[column] === 'string')
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
						// eslint-disable-next-line no-shadow
						const { displayURLMetrics, displayUTMMetrics } = this.state;
						metricsList = [...(isURL ? displayURLMetrics : displayUTMMetrics)];

						// show only metrices that are in displayURLAndUTMMetricsList
						newState = { ...newState, metricsList };
					}
				}

				newState = {
					...newState,
					isLoading: false,
					tableData,
					isURL,
					pageIndex: 0,
					pagesFetched: 0
				};
				this.setState(newState);
			});
		});
	};

	getSortedMetaMetrics = metaMetrics => {
		const metaMetricsArray = Object.keys(metaMetrics).map(value => {
			// eslint-disable-next-line camelcase
			const { display_name: name, table_position, valueType } = metaMetrics[value];

			return {
				name,
				value,
				valueType,
				table_position
			};
		});
		return sortBy(metaMetricsArray, ['table_position']);
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
		const { urlUTMReportingMeta } = this.props;

		const filteredMetrics = tableData.columns.filter(metric => {
			const isDimension = !!urlUTMReportingMeta.data.dimension[metric];
			const isBlacklistedMetric = REPORT_INTERVAL_TABLE_KEYS.indexOf(metric) !== -1;
			const isSelectableMetric =
				urlUTMReportingMeta.data.metrics[metric] &&
				urlUTMReportingMeta.data.metrics[metric].selectable;
			return !isDimension && !isBlacklistedMetric && isSelectableMetric;
		});

		const sortedMetaMetrics = this.getSortedMetaMetrics(urlUTMReportingMeta.data.metrics);

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
		const { urlUTMReportingMeta } = this.props;
		const sortedMetaMetrics = this.getSortedMetaMetrics(urlUTMReportingMeta.data.metrics);
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

	getContentInfo = urlUTMReportingMetaData => {
		let {
			selectedDimension,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			searchFilter,
			selectedFilters,
			selectedInterval,
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
		const { site: reportingSites, interval: intervalsObj } = urlUTMReportingMetaData;
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
			const {
				dimension,
				order,
				orderBy,
				totalRecords,
				regexFilter,
				interval,
				fromDate,
				toDate
			} = selectedControls;
			selectedDimension = dimension;
			selectedOrder = order;
			selectedOrderBy = orderBy;
			selectedTotalRecords = totalRecords;
			searchFilter = regexFilter;
			selectedInterval = interval || 'daily';
			startDate = fromDate;
			endDate = toDate;
		}

		const { dimensionList, filterList, metricsList } = this.getControlChangedParams({
			startDate,
			endDate,
			selectedInterval,
			selectedDimension,
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			searchFilter,
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
				selectedOrder,
				selectedOrderBy,
				selectedTotalRecords,
				searchFilter,
				selectedFilters,
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
		urlUTMReportingMeta,
		selectedDimension,
		selectedOrder,
		selectedOrderBy,
		selectedTotalRecords,
		searchFilter,
		selectedFilters,
		reportType,
		tableData
	) => {
		let allAvailableMetrics = [];
		if (
			isCustomizeChartLegend &&
			urlUTMReportingMeta &&
			urlUTMReportingMeta.data &&
			urlUTMReportingMeta.data.metrics &&
			typeof urlUTMReportingMeta.data.metrics === 'object' &&
			Object.keys(urlUTMReportingMeta.data.metrics).length &&
			tableData &&
			tableData.result &&
			tableData.result.length
		) {
			const allAvailableMetricsArr = Object.keys(urlUTMReportingMeta.data.metrics)
				.filter(key => urlUTMReportingMeta.data.metrics[key].selectable)
				.map(key => {
					const { display_name: name, valueType } = urlUTMReportingMeta.data.metrics[key];
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

	filterTableDataBySelectedMetrics = tableData => {
		const selectedMetricsTableData = tableData;
		// eslint-disable-next-line no-shadow
		const { isURL } = this.state;

		const metricNameList = (isURL ? displayURLMetrics : displayUTMMetrics).map(
			metrics => metrics.value
		);
		selectedMetricsTableData.columns = metricNameList;

		const computedTotal = { ...selectedMetricsTableData.total };
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
			selectedOrder,
			selectedOrderBy,
			selectedTotalRecords,
			searchFilter,
			selectedFilters,
			selectedInterval,
			selectedMetrics,
			displayURLAndUTMMetrics,
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

		let { pageSize, pageIndex } = this.state;
		let recordCount = 0;

		const {
			reportType: defaultReportType,
			isForOps,
			userSites,
			user,
			showNotification
		} = this.props;

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

		if (tableData.result && tableData.result.length) {
			selectedMetricsTableData = this.filterTableDataBySelectedMetrics(
				selectedMetricsTableData,
				metricsList,
				dimensionList
			);
			recordCount = tableData.result.length;
		}
		if (searchFilter) {
			const pattern = new RegExp(searchFilter);
			selectedMetricsTableData.result =
				selectedMetricsTableData.result.filter(item => pattern.test(item.url)) || [];

			const newLength = selectedMetricsTableData.result.length;
			pageSize = newLength > pageSize ? pageSize : newLength;
			pageIndex = 0;
			recordCount = newLength;
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
						displayURLAndUTMMetrics={displayURLAndUTMMetrics}
						selectedDimension={selectedDimension}
						selectedOrder={selectedOrder}
						selectedOrderBy={selectedOrderBy}
						selectedTotalRecords={selectedTotalRecords}
						searchFilter={searchFilter}
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
						pageSize={pageSize}
						pageIndex={pageIndex}
						recordCount={recordCount}
					/>
				</Col>
				<Col sm={12} className="u-margin-b4 url-reporting-table">
					<TableContainer
						tableData={selectedMetricsTableData}
						aggregatedData={aggregatedData}
						startDate={startDate}
						endDate={endDate}
						selectedInterval={selectedInterval}
						selectedDimension={selectedDimension}
						selectedOrder={selectedOrder}
						selectedOrderBy={selectedOrderBy}
						getCsvData={this.getCsvData}
						reportType={reportType}
						defaultReportType={defaultReportType}
						isForOps={isForOps}
						onPageSizeChange={this.onPageSizeChange}
						onPageChange={this.onPageChange}
						showPaginationTop={false}
					/>
				</Col>
			</Row>
		);
	};

	render() {
		const { isLoading, show } = this.state;
		const { urlUTMReportingMeta } = this.props;

		if (!urlUTMReportingMeta.fetched || isLoading) {
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
