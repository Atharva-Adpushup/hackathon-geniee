/* eslint-disable no-prototype-builtins */
import React, { Component } from 'react';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import { Row, Col, OverlayTrigger, Tooltip } from '@/Client/helpers/react-bootstrap-imports';
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
import FilterLegend from './FilterLegend';
import reportService from '../../../services/reportService';
import { DEMO_ACCOUNT_DATA } from '../../../constants/others';
import XPathAndAPImpressions from './XPathAndAPImpressionsReporting';
import Loader from '../../../Components/Loader';
import { convertObjToArr, roundOffTwoDecimal } from '../helpers/utils';
import {
	getReportingDemoUserValidation,
	getReportingDemoUserSiteIds,
	getDemoUserSites,
	isSameScheduleOptions
} from '../../../helpers/commonFunctions';
import {
	displayMetrics,
	displayOpsMetrics,
	displayUniqueImpressionMetrics,
	displayOpsMetricsForXPath,
	displayOpsUniqueImpressionMetrics,
	opsDimension,
	opsFilter,
	REPORT_INTERVAL_TABLE_KEYS,
	columnsBlacklistedForAddition,
	DEFAULT_ERROR_MESSAGE,
	XPATH_ALLOWED_DIMENSIONS_AND_FILTERS,
	REPORT_TYPES
} from '../configs/commonConsts';
import MixpanelHelper from '../../../helpers/mixpanel';

class Report extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dimensionList: [],
			filterList: [],
			intervalList: [],
			// eslint-disable-next-line no-nested-ternary
			metricsList: props.isForOps ? displayOpsMetrics : displayMetrics,
			selectedDimension: [],
			selectedFilters: {},
			selectedFilterValues: {},
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
			isLoading: !props.isForOps,
			isError: false,
			errorMessage: '',
			isValidSite: true,
			isReportingSite: true,
			savedReports: [],
			frequentReports: [],
			selectedReport: null,
			selectedReportName: '',
			apiLoadTimeStartedAt: null,
			getCustomStatResponseStatus: 'failed',
			lastReportQuery: { initalQuery: true },
			apiFinalResponseTime: null,
			dataFetchedDimension: []
		};
	}

	componentDidMount() {
		const { userSites, updateReportMetaData, reportsMeta, isForOps, associatedSites } = this.props;
		const { email, reportType } = this.getDemoUserParams();

		let userSitesStr = '';
		let isSuperUser = false;

		// site id should be appened into getMetaData API if case current user is not Ops or reportType is account
		if (reportType === 'account' || !isForOps) {
			userSitesStr = Object.keys(userSites).toString();

			userSitesStr = getReportingDemoUserSiteIds(userSitesStr, email, reportType);
		}

		if (isForOps || reportType === 'global') {
			isSuperUser = true;
			if (associatedSites.length) {
				userSitesStr = [...Object.keys(userSites), ...associatedSites].join(',');
			}
		}

		const params = { sites: userSitesStr };

		// eslint-disable-next-line no-unused-expressions
		isSuperUser ? (params.isSuperUser = isSuperUser) : null;
		if (!reportsMeta.fetched) {
			return reportService
				.getMetaData(params)
				.then(response => {
					let { data: computedData } = response;
					computedData = getDemoUserSites(computedData, email);
					updateReportMetaData(computedData);
					return this.getContentInfo(computedData);
				})
				.catch(this.handleError);
		}
		return this.getContentInfo(reportsMeta.data);
	}

	componentDidUpdate() {
		const { isLoading } = this.state;
		if (!isLoading) {
			const finalRenderTimeTaken = new Date().getTime();
			this.componentLoadingCompleted(finalRenderTimeTaken);
		}
	}

	handleError = err => {
		const {
			user: { data: user }
		} = this.props;
		const isAdmin = !!user.isSuperUser;
		const errorMessage =
			err && err.response && err.response.data && err.response.data.data && isAdmin
				? err.response.data.data.data || err.response.data.data.message || DEFAULT_ERROR_MESSAGE
				: DEFAULT_ERROR_MESSAGE;
		this.setState({
			isLoading: false,
			isError: true,
			errorMessage,
			apiFinalResponseTime: new Date().getTime()
		});
	};

	componentLoadingCompleted = finalRenderTimeTaken => {
		const {
			apiLoadTimeStartedAt,
			apiFinalResponseTime,
			getCustomStatResponseStatus,
			lastReportQuery
		} = this.state;
		if (apiLoadTimeStartedAt) {
			const responseLoadTime = apiFinalResponseTime - apiLoadTimeStartedAt;
			const totalRenderTime = finalRenderTimeTaken - apiLoadTimeStartedAt;
			const properties = {
				componentName: 'Reports',
				responseLoadTime,
				totalRenderTime,
				apiResponseStatus: getCustomStatResponseStatus,
				group: 'componentApiLoadMonitoring',
				...lastReportQuery
			};
			MixpanelHelper.trackEvent('Performance', properties);
			this.setState({ apiLoadTimeStartedAt: null });
		}
	};

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
			userSites,
			user: {
				data: { isSuperUser }
			}
		} = this.props;

		// For the publishers with Single site - we should enable all the dimensions, metrics by default
		const sitesCount = Object.keys(userSites).length;

		const { dimension: dimensionListObj, filter: filterListObj } = reportsMeta.data;
		const dimensionList = convertObjToArr(dimensionListObj);
		const filterList = convertObjToArr(filterListObj);
		const { updatedDimensionList, updatedFilterList } = isSuperUser
			? { updatedDimensionList: dimensionList, updatedFilterList: filterList }
			: this.removeOpsFilterDimension(filterList, dimensionList);

		// Enable all dimensions, filters if pub has only one site
		if (sitesCount !== 1 || reportType === 'global') {
			updatedFilterList.forEach(filter => {
				// eslint-disable-next-line no-param-reassign
				filter.isDisabled = this.isControlItemDisabled(filter, disabledFilter, reportType);
			});

			updatedDimensionList.forEach(dimension => {
				// eslint-disable-next-line no-param-reassign
				dimension.isDisabled = this.isControlItemDisabled(dimension, disabledDimension, reportType);
			});
		}

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

	onControlChange = (data, reportType, resetSavedReport = true) => {
		const params = this.getControlChangedParams({ ...data, reportType });
		const { selectedFilterValues, selectedReport } = this.state;
		const newStateData = { ...data };
		if (data.selectedFilterKey && data.selectedFilterValues) {
			newStateData.selectedFilterValues = {
				...selectedFilterValues,
				[newStateData.selectedFilterKey]: [...newStateData.selectedFilterValues]
			};
			delete newStateData.selectedFilterKey;
		}

		const newSelectedReport = !resetSavedReport ? selectedReport : null;

		this.setState({
			...newStateData,
			...params,
			reportType,
			selectedReport: newSelectedReport
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
		const { selectedDimension = [], selectedFilters, reportType } = controlParams;
		const { reportsMeta } = this.props;
		const { dimension: dimensionList = {}, filter: filterList = {} } = reportsMeta.data;
		let disabledFilter = [];
		let disabledDimension = [];
		let disabledMetrics = [];
		for (const dimension of selectedDimension) {
			const dimensionObj = dimensionList[dimension];

			if (dimensionObj) {
				disabledFilter = dimensionObj.disabled_filter || disabledFilter;
				disabledDimension = dimensionObj.disabled_dimension || disabledDimension;
				disabledMetrics = dimensionObj.disabled_metrics || disabledMetrics;
			}
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
		const {
			userSites,
			isCustomizeChartLegend,
			defaultReportType,
			associatedSites,
			isForOps
		} = this.props;
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
			dimension: selectedDimension ? selectedDimension.join(',') : null
		};

		if (!isCustomizeChartLegend) {
			params.metrics = selectedMetrics ? selectedMetrics.toString() : '';
		}

		Object.keys(selectedFilters).forEach(filter => {
			const filters = Object.keys(selectedFilters[filter]);
			params[filter] = filters.length > 0 ? filters.toString() : null;
		});

		if (!params.siteid && reportType !== 'global') {
			const siteIds = Object.keys(userSites);
			params.siteid = siteIds.toString();
		}

		if (isForOps) {
			// this flag is now mandatory for fetching gross_revenue
			params.isSuperUser = true;
		}

		if (reportType === 'global' || defaultReportType === 'global') {
			params.isSuperUser = true;
			// restrict the access in global reports for Ops team members
			// allow accounts associated with the user only in the global reports
			if (associatedSites.length) {
				params.siteid = [...Object.keys(userSites), ...associatedSites].join(',');
			}
		}

		if (reportType === 'global' && !params.siteid) {
			params.siteid = '';
		}

		if (reportType === 'account') {
			params.siteid = getReportingDemoUserSiteIds(params.siteid, email, reportType);
		}

		// cache can be bypassed for smoke testing in production by adding a key in localStorage.
		params.bypassCache = window.localStorage.getItem('apBypassReportCache') || 'false';

		return params;
	};

	generateButtonHandler = (inputState = {}) => {
		if (Object.keys(inputState).length) {
			const {
				reportType,
				selectedInterval,
				selectedDimension,
				selectedFilters,
				startDate,
				endDate
			} = inputState;
			const reportDateDifference = moment(endDate).diff(moment(startDate), 'days') + 1;
			const properties = {
				reportType,
				reportDateDifference,
				interval: selectedInterval,
				dimension: selectedDimension,
				filters: Object.keys(selectedFilters),
				toDate: endDate,
				fromDate: startDate
			};
			this.setState({ lastReportQuery: properties });
			MixpanelHelper.trackEvent('Reports', properties);
		}
		let { tableData, metricsList, selectedFilterValues } = this.state;
		const { reportType, isForOps } = this.props;
		const computedState = Object.assign({ isLoading: true }, inputState);
		const prevMetricsList = metricsList;

		this.setState(computedState, () => {
			const { selectedDimension, selectedFilters, dimensionList } = this.state;
			let newState = {};
			const params = this.formateReportParams();
			let XPATHParams = {};

			this.setState({
				apiLoadTimeStartedAt: new Date().getTime(),
				getCustomStatResponseStatus: 'failed'
			});

			// check if valid dimension is selected
			if (isForOps) {
				if (selectedDimension.length) {
					const validDimensionsForXPath = this.getValidDimensionListParamsForXPath(
						selectedDimension
					);
					// filter out all invalid filters for XPath
					XPATHParams = this.validateReportParamsForXPath({
						...params,
						dimension: validDimensionsForXPath.join(',')
					});
				} else {
					// filter out all invalid filters for XPath
					XPATHParams = this.validateReportParamsForXPath({ ...params });
				}
			}

			reportService
				.getCustomStats(params)
				.then(response => {
					this.setState({ apiFinalResponseTime: new Date().getTime() });
					if (Number(response.status) === 200 && response.data && !response.data.error) {
						tableData = response.data.data;
						this.setState({ getCustomStatResponseStatus: 'success' });

						const shouldAddAdpushupCountPercentColumn =
							(selectedDimension.includes('mode') ||
								selectedDimension.includes('error_code') ||
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
							(reportType === 'global' || isForOps) &&
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

					newState = {
						...newState,
						isLoading: false,
						isError: false,
						tableData,
						selectedFilterValues,
						dataFetchedDimension: selectedDimension,
						XPATHParams
					};
					this.setState(newState, () => {
						const { selectedInterval } = inputState;
						if (selectedInterval === 'cumulative') {
							// Expand Tree view - trigger force click on Caret Icon.
							setTimeout(() => {
								Array.from(document.getElementsByClassName('rt-pivot')).map(item => {
									item.click();
									return item;
								});
							}, 300);
						}
					});
				})
				.catch(this.handleError);
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
			// check if unique imp is checked
			if (isUniqueImpEnabled) {
				match = displayOpsUniqueImpressionMetrics.map(item => item.value);
			}
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
			total.hasOwnProperty('total_adpushup_impressions') &&
			total.hasOwnProperty('total_adpushup_ad_ecpm')
		) {
			total.total_adpushup_ad_ecpm =
				(total.total_network_net_revenue / total.total_adpushup_impressions) * 1000;
		}

		if (
			total.hasOwnProperty('total_network_ad_ecpm') &&
			total.hasOwnProperty('total_network_impressions') &&
			total.hasOwnProperty('total_network_net_revenue')
		) {
			total.total_network_ad_ecpm =
				(total.total_network_net_revenue / total.total_network_impressions) * 1000;
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

		if (total.hasOwnProperty('total_session_rpm')) {
			total.total_session_rpm /= tableRows.length;
		}

		if (total.hasOwnProperty('total_adpushup_count_percent')) {
			delete total.total_adpushup_count_percent;
		}

		if (
			total.hasOwnProperty('total_network_ad_ctr') &&
			total.hasOwnProperty('total_network_impressions') &&
			total.hasOwnProperty('total_network_ad_clicks')
		) {
			total.total_network_ad_ctr =
				(total.total_network_ad_clicks / total.total_network_impressions) * 100;
		}
		if (
			total.hasOwnProperty('total_unique_ad_ctr') &&
			total.hasOwnProperty('total_unique_impressions') &&
			total.hasOwnProperty('total_unique_ad_clicks')
		) {
			total.total_unique_ad_ctr =
				(total.total_unique_ad_clicks / total.total_unique_impressions) * 100;
		}
		if (
			total.hasOwnProperty('total_network_net_revenue') &&
			total.hasOwnProperty('total_unique_impressions')
		) {
			total.total_unique_ad_ecpm =
				(total.total_network_net_revenue / total.total_unique_impressions) * 1000;
		}
		return total;
	};

	updateMetrics = (newMetrics = []) => {
		const { reportsMeta, isForOps, overrideOpsPanelUniqueImpValue } = this.props;
		const sortedMetaMetrics = this.getSortedMetaMetrics(reportsMeta.data.metrics);
		let sortedMetrics = [];
		const found = newMetrics.filter(item => item.value === 'unique_impressions');
		if (isForOps) {
			let selectedMetricsFromChart = [...newMetrics];
			// if unique impression selected
			if (found.length) {
				// Set unique impression equalent of enabled metrics when unique imp  is enabled
				selectedMetricsFromChart = selectedMetricsFromChart.map(metric => {
					const matchFound = displayOpsUniqueImpressionMetrics.find(
						displayOpsUnqImpMetric => displayOpsUnqImpMetric.name === `Unique ${metric.name}`
					);
					return matchFound || metric;
				});

				const match = selectedMetricsFromChart.map(item => item.value);
				sortedMetrics = sortedMetaMetrics.filter(item => match.indexOf(item.value) !== -1);
				// temp code for unqiue imp selection in dashboard from this component
				overrideOpsPanelUniqueImpValue({ isUniqueImpEnabled: true });
			} else {
				// replace metrics with unique metrics if enabled
				selectedMetricsFromChart = selectedMetricsFromChart.map(metric => {
					const matchFound = displayOpsMetrics.find(
						displayMetric => displayMetric.name === metric.name
					);
					return matchFound || metric;
				});

				const match = selectedMetricsFromChart.map(item => item.value);
				sortedMetrics = sortedMetaMetrics.filter(item => match.indexOf(item.value) !== -1);
				// temp code for unqiue imp selection in dashboard from this component
				overrideOpsPanelUniqueImpValue({ isUniqueImpEnabled: false });
			}
			sortedMetaMetrics.forEach(metaMetric => {
				const foundMetric = selectedMetricsFromChart.find(
					metric => metric.name === metaMetric.name
				);
				if (foundMetric) {
					if (foundMetric.name === 'Unique Impressions Reporting') {
						return;
					}
					const alreadyInSortedMetrics = sortedMetrics.find(
						sortedMetric => sortedMetric.name === foundMetric.name
					);
					if (!alreadyInSortedMetrics) {
						sortedMetrics.push(foundMetric);
					}
				}
			});
		} else {
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

			const sessionMetrics = newMetrics.filter(
				item => item.value === 'session_rpm' || item.value === 'user_sessions'
			);
			if (sessionMetrics.length) {
				sortedMetaMetrics.forEach(metaMetric => {
					const foundMetric = sessionMetrics.find(metric => metric.value === metaMetric.value);
					if (foundMetric) sortedMetrics.push(foundMetric);
				});
			}
		}

		this.setState({ metricsList: sortedMetrics });
	};

	getCsvData = csvData => {
		this.setState({ csvData });
	};

	getXPathCSVCsvData = csvDataXPath => {
		let { csvData } = this.state;

		// merge if record count is same
		if (csvData.length === csvDataXPath.length) {
			csvData = csvData.map((row, index) => row.concat(csvDataXPath[index].slice(2)));
		}
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
			userSites,
			isForOps
		} = this.props;
		let isSuperUser = false;
		if (isForOps || reportType === 'global') {
			isSuperUser = true;
		}

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
			const { dimension = '', interval, fromDate, toDate, chartLegendMetric } = selectedControls;
			selectedDimension = dimension.split(',');
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
			() => {
				this.getSavedAndFrequentReports();
				if (!isSuperUser) {
					this.generateButtonHandler();
				}
			}
		);
	};

	getAllAvailableMetrics = (isCustomizeChartLegend, reportsMeta, tableData) => {
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

	// eslint-disable-next-line react/sort-comp
	aggregateValues(result = []) {
		const modifiedResult = [];
		const { selectedInterval, startDate, endDate } = this.state;

		result.forEach(row => {
			const tableRow = { ...row };
			tableRow.day = `${moment(tableRow.date).format('dddd')}`;

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

	handleInputChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	getValidDimensionListParamsForXPath = selectedDimension => {
		const validDimensions = selectedDimension.filter(dimension =>
			XPATH_ALLOWED_DIMENSIONS_AND_FILTERS.includes(dimension)
		);
		return validDimensions;
	};

	validateReportParamsForXPath = XPathParams => {
		const { selectedFilters } = this.state;
		// check for XPAth Allowed filters
		Object.keys(selectedFilters).forEach(filter => {
			if (!XPATH_ALLOWED_DIMENSIONS_AND_FILTERS.includes(filter)) {
				// eslint-disable-next-line no-param-reassign
				delete XPathParams[filter];
			}
		});
		delete XPathParams.isSuperUser;
		return XPathParams;
	};

	getSavedAndFrequentReports = () => {
		const { showNotification } = this.props;
		return reportService
			.getSavedAndFrequentReports()
			.then(res => {
				const { savedReports, frequentReports = [] } = res.data.data || {};
				this.processAndSaveReports(savedReports, frequentReports);
			})
			.catch(err => {
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: err.message || 'Something went wrong !',
					autoDismiss: 5
				});
			});
	};

	frequentReportsTooltip = report => {
		const {
			selectedDimension: dimension,
			selectedFilters: filters = {},
			selectedInterval: intervals
		} = report;
		const { dimensionList = [] } = this.state;
		const dimensionData = dimensionList
			.filter(dim => dimension && dimension.includes(dim.value))
			.map(dim => dim.display_name)
			.join(', ');

		const filterUi = Object.keys(filters)
			.filter(currentFilter => filters[currentFilter] && Object.keys(filters[currentFilter]).length)
			.map(filter => {
				const values = chunk(Object.keys(filters[filter]), 3)
					.map(items => items.join(','))
					.join(',\n');
				const filterData = dimensionList.find(dim => dim.value === filter);
				if (!filterData) return null;
				return (
					<div>
						{filterData.display_name}: {values}
					</div>
				);
			});
		return (
			<Tooltip placement="top">
				{dimension && dimensionData && <div>Report By: {dimensionData}</div>}
				{intervals && intervals !== '' && <div>Interval: {intervals}</div>}
				{filterUi}
			</Tooltip>
		);
	};

	processAndSaveReports = (savedReports = [], frequentReports = [], callback = () => {}) => {
		const { dimensionList } = this.state;
		const dimensionsMap = dimensionList.reduce(
			(results, dimension) => ({ ...results, [dimension.value]: dimension }),
			{}
		);

		const savedReportsWithValue = savedReports.map(report => ({
			...report,
			value: report.id,
			label: (
				<OverlayTrigger
					overlay={this.frequentReportsTooltip(report)}
					key={report.id}
					placement="top"
				>
					<span>{report.name}</span>
				</OverlayTrigger>
			),
			type: 'savedReport'
		}));

		const frequentReportsDimensionCount = {};
		const frequentReportsWithValue = frequentReports.map(report => {
			const dimensions = report.selectedDimension ? report.selectedDimension.join(',') : '';
			if (frequentReportsDimensionCount[dimensions]) {
				frequentReportsDimensionCount[dimensions] += 1;
			} else {
				frequentReportsDimensionCount[dimensions] = 1;
			}

			let reportName = '';
			if (dimensions === '') {
				reportName = `Report ${frequentReportsDimensionCount[dimensions]}`;
			} else {
				const dimensionsTitles = report.selectedDimension
					.map(dimension => dimensionsMap[dimension].display_name)
					.join(', ');
				reportName = `Report by ${dimensionsTitles} ${frequentReportsDimensionCount[dimensions]}`;
			}
			return {
				...report,
				value: report.id,
				label: (
					<OverlayTrigger
						overlay={this.frequentReportsTooltip(report)}
						key={report.id}
						placement="top"
					>
						<span>{reportName}</span>
					</OverlayTrigger>
				),
				type: 'frequentReport'
			};
		});
		this.setState(
			{
				savedReports: savedReportsWithValue,
				frequentReports: frequentReportsWithValue
			},
			callback
		);
	};

	setSelectedReport = (selectedReport, callback) => {
		this.setState(
			{
				selectedReport,
				selectedReportName: selectedReport.name
			},
			() => callback && callback()
		);
	};

	onReportSave = (scheduleOptions, reportName) => {
		const {
			startDate,
			endDate,
			selectedDimension,
			selectedFilters,
			selectedInterval,
			savedReports = []
		} = this.state;
		const { showNotification, userSites } = this.props;

		const existingReportWithName = savedReports.find(report => report.name === reportName);
		if (existingReportWithName) {
			showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: `Report with name ${reportName} already exists..`,
				autoDismiss: 5
			});
			return;
		}

		if (scheduleOptions && scheduleOptions.interval) {
			if (!scheduleOptions.startDate) {
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: `Start Date mandatory to schedule report`,
					autoDismiss: 5
				});
				return;
			}
		}

		const filters = Object.assign({}, selectedFilters);
		if (!filters || !filters.siteid || !Object.keys(filters.siteid).length) {
			// If there are no site id's, send all site ID's of the user so that the scheduler has a context of which sites to fetch reports for.
			filters.siteid = Object.keys(userSites).reduce(
				(sites, siteid) => ({ ...sites, [siteid]: true }),
				{}
			);
		}

		const reportConfig = {
			name: reportName,
			startDate,
			endDate,
			selectedDimension,
			selectedFilters: filters,
			selectedInterval,
			scheduleOptions
		};

		reportService
			.saveReportConfig(reportConfig)
			.then(res => {
				const response = res.data.data;
				const { savedReports: newSavedReports, frequentReports } = response;
				this.processAndSaveReports(newSavedReports, frequentReports, () => {
					showNotification({
						mode: 'success',
						title: 'Success',
						message: 'Report Saved',
						autoDismiss: 5
					});
				});
			})
			.catch(err => {
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: err.message || 'Something went wrong !',
					autoDismiss: 5
				});
			});
	};

	onReportUpdate = (scheduleOptions, reportName) => {
		const { selectedReport, savedReports = [] } = this.state;
		const { showNotification } = this.props;
		const updateReportConfig = {
			name: reportName,
			id: selectedReport.id
		};

		const existingReportWithName = savedReports.find(
			report => report.name === reportName && selectedReport.id !== report.id
		);
		if (existingReportWithName) {
			showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: `Report with name ${reportName} already exists..`,
				autoDismiss: 5
			});
			return;
		}

		if (scheduleOptions && scheduleOptions.interval) {
			if (!scheduleOptions.startDate) {
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: `Start Date mandatory to schedule report`,
					autoDismiss: 5
				});
				return;
			}
		}

		// only send schedule options if it differs
		if (!isSameScheduleOptions(selectedReport.scheduleOptions, scheduleOptions)) {
			updateReportConfig.scheduleOptions = scheduleOptions;
		}
		reportService
			.updateSavedAndFrequentReports(updateReportConfig)
			.then(res => {
				const response = res.data.data;
				const { savedReports, frequentReports } = response;
				this.processAndSaveReports(savedReports, frequentReports, () => {
					showNotification({
						mode: 'success',
						title: 'Success',
						message: 'Report Updated',
						autoDismiss: 5
					});
				});
			})
			.catch(err =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: err.message || 'Something went wrong !',
					autoDismiss: 5
				})
			);
	};

	onReportDelete = () => {
		const { selectedReport } = this.state;
		const { showNotification } = this.props;
		reportService
			.deleteSavedReport(selectedReport.id)
			.then(res => {
				const response = res.data.data;
				const { savedReports, frequentReports } = response;
				this.processAndSaveReports(savedReports, frequentReports, () => {
					showNotification({
						mode: 'success',
						title: 'Success',
						message: 'Report Deleted',
						autoDismiss: 5
					});
				});
			})
			.catch(err =>
				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: err.message || 'Something went wrong !',
					autoDismiss: 5
				})
			);
	};

	updateReportName = name => {
		this.setState({
			selectedReportName: name
		});
	};

	showXPathTable = () => {
		const { XPATHParams = {} } = this.state;
		const { isForOps } = this.props;

		if (!Object.keys(XPATHParams).length || !isForOps) {
			return false;
		}
		return true;
	};

	renderContent = () => {
		const {
			selectedDimension,
			selectedFilters,
			selectedFilterValues,
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
			tableData,
			savedReports,
			frequentReports,
			selectedReport,
			selectedReportName,
			dataFetchedDimension,
			isLoading,
			XPATHParams
		} = this.state;
		const {
			reportsMeta,
			reportType: defaultReportType,
			isCustomizeChartLegend,
			isForOps,
			userSites,
			user,
			showNotification,
			match,
			location,
			associatedSites
		} = this.props;
		const { sessionRpmReports: sessionRpmReportsEnabled = false } = user.data;

		let allAvailableMetrics = this.getAllAvailableMetrics(
			isCustomizeChartLegend,
			reportsMeta,
			tableData
		);

		if (!isForOps) {
			allAvailableMetrics = allAvailableMetrics.filter(
				item =>
					item.value === 'unique_impressions' ||
					(sessionRpmReportsEnabled &&
						(item.value === 'session_rpm' || item.value === 'user_sessions'))
			);
		}

		allAvailableMetrics = allAvailableMetrics
			.filter(item => {
				if (item.value === 'unique_impressions') {
					return true;
				}
				return item.value.indexOf('unique') === -1;
			})
			.map(item => {
				if (item.value === 'unique_impressions') {
					// eslint-disable-next-line no-param-reassign
					item.name = 'Unique Impressions Reporting';
					// eslint-disable-next-line no-param-reassign
					item.isDisabled = false;
				}
				return item;
			});

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
		const displayOpsMetricsNameForXPath = displayOpsMetricsForXPath.map(metric => metric.value);
		allAvailableMetrics = allAvailableMetrics.filter(
			metric => !displayOpsMetricsNameForXPath.includes(metric.value)
		);

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
						associatedSites={associatedSites}
						user={user}
						showNotification={showNotification}
						savedReports={savedReports}
						frequentReports={frequentReports}
						selectedReport={selectedReport}
						setSelectedReport={this.setSelectedReport}
						onReportSave={this.onReportSave}
						onReportUpdate={this.onReportUpdate}
						onReportDelete={this.onReportDelete}
						resetSelectedReport={this.resetSelectedReport}
						selectedReportName={selectedReportName}
						updateReportName={this.updateReportName}
						selectedFilterValues={selectedFilterValues}
					/>
				</Col>
				<Col sm={12}>
					<FilterLegend selectedFilters={selectedFilterValues} filtersList={filterList} />
				</Col>
				{(dataFetchedDimension.length > 0 &&
					dataFetchedDimension.map((dimension, index) => (
						<Col sm={12} className="u-margin-t5 u-margin-b5">
							<ChartContainer
								tableData={tableData}
								selectedDimension={dimension}
								startDate={startDate}
								endDate={endDate}
								metricsList={metricsList}
								allAvailableMetrics={allAvailableMetrics}
								reportType={reportType}
								isForOps={isForOps}
								index={index}
								isCustomizeChartLegend={isCustomizeChartLegend}
								updateMetrics={this.updateMetrics}
								selectedInterval={selectedInterval}
								selectedChartLegendMetric={selectedChartLegendMetric}
							/>
						</Col>
					))) || (
					<Col sm={12} className="u-margin-t5">
						<ChartContainer
							tableData={tableData}
							selectedDimension=""
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
							index={0}
						/>
					</Col>
				)}

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
						onPageChange={this.onPageChange}
						showPaginationTop={false}
					/>
					{/* )} */}
				</Col>
				{!isLoading && this.showXPathTable() && (
					<Col sm={12} className="">
						<XPathAndAPImpressions
							user={user}
							userSites={userSites}
							match={match}
							location={location}
							startDate={startDate}
							endDate={endDate}
							XPATHParams={XPATHParams}
							selectedFilters={selectedFilters}
							selectedInterval={selectedInterval}
							selectedDimension={selectedDimension}
							dimensionList={dimensionList}
							metricsList={metricsList}
							reportsMeta={reportsMeta}
							defaultReportType={defaultReportType}
							reportType={reportType}
							isForOps={isForOps}
							getXPathCSVCsvData={this.getXPathCSVCsvData}
						/>
					</Col>
				)}
			</Row>
		);
	};

	render() {
		const { isLoading, isError, errorMessage } = this.state;
		const { reportsMeta, hasFindsUserDataFetched, reportType } = this.props;

		if (
			(!reportsMeta.fetched && !isError) ||
			(reportType === REPORT_TYPES.GLOBAL && !hasFindsUserDataFetched) ||
			isLoading
		) {
			return <Loader />;
		}

		if (!isLoading && isError) {
			return <Empty message={errorMessage} />;
		}
		return (
			<React.Fragment>
				<ActionCard title="AdPushup Reports">{this.renderContent()}</ActionCard>
			</React.Fragment>
		);
	}
}

export default Report;
