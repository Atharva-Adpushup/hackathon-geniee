import React, { Fragment } from 'react';
import moment from 'moment';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'react-router-dom';
import { Button } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import '../../../../../scss/pages/dashboard/index.scss';
import Empty from '../../../../../Components/Empty/index';
import Card from '../../../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../../../../../Pages/Dashboard/containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../../../../../Pages/Dashboard/containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../../../../../Pages/Dashboard/containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../../../../../Pages/Dashboard/containers/PerformanceApOriginalContainer';
import RevenueContainer from '../../../../../Pages/Dashboard/containers/RevenueContainer';
import ModeReportContainer from '../../../containers/ModeReportContainer';
import Loader from '../../../../../Components/Loader/index';
import {
	dates,
	DEFAULT_DATE,
	ALL_SITES_VALUE,
	REPORT_LINK
} from '../../../../../Pages/Dashboard/configs/commonConsts';
import { TOP_TEN_SITE_WIDGETS_COLUMNS } from '../../../configs/commonConsts';
import SelectBox from '../../../../../Components/SelectBox/index';
import reportService from '../../../../../services/reportService';
import { convertObjToArr, getDateRange } from '../../../../../Pages/Dashboard/helpers/utils';

class QuickSnapshot extends React.Component {
	constructor(props) {
		super(props);
		const { sites } = props;
		const allUserSites = [ALL_SITES_VALUE, ...convertObjToArr(sites)];
		this.state = {
			isLoading: true,
			isLoadingError: false,
			quickDates: dates,
			reportType: 'account',
			selectedSite: 'all',
			sites: allUserSites,
			top10Sites: [],
			modeConfig: [],
			errorCodeConfig: [],
			widgetsConfig: [],
			reportingSites: {},
			widget: [],
			metrics: {}
		};
	}

	componentDidMount() {
		const getReportMetaData = this.getComputedMetaData();

		return getReportMetaData
			.then(metaData => {
				const promiseArray = [
					this.getTop10Sites(metaData),
					this.getAllModes(metaData),
					this.getAllErrorCodes(metaData)
				];

				return Promise.all(promiseArray).then(() => this.renderComputedWidgetsUI());
			})
			.catch(this.rootErrorHandler);
	}

	rootErrorHandler = () => {
		const { showNotification } = this.props;

		showNotification({
			mode: 'error',
			title: 'OpsPanel Reporting Error',
			message: `Something is broken. Please check after some time`,
			autoDismiss: 0
		});

		return this.setState({ isLoading: false, isLoadingError: true });
	};

	getComputedMetaData = () => {
		const {
			globalReportMetaData,
			accountForSuperUserReportMetaData,
			sites,
			associatedSites
		} = this.props;

		let siteIdsForGlobal = '';
		if (associatedSites.length) {
			siteIdsForGlobal = [...Object.keys(sites), ...associatedSites].join(',');
		}
		const { reportType } = this.state;
		const params = {
			sites: reportType === 'account' ? Object.keys(sites).join(',') : siteIdsForGlobal,
			isSuperUser: true
		};

		const inputReportMetaData =
			reportType === 'account' ? accountForSuperUserReportMetaData : globalReportMetaData;

		const isValidReportMetaData = !!(
			inputReportMetaData &&
			inputReportMetaData.fetched &&
			inputReportMetaData.data &&
			Object.keys(inputReportMetaData.data).length
		);
		const reportAPI = isValidReportMetaData
			? Promise.resolve(inputReportMetaData)
			: reportService.getMetaData(params);

		return reportAPI.then(responseData => {
			const { data: metaData } = responseData;

			if (!isValidReportMetaData) {
				this.setReportingMetaData(metaData);
			}

			this.setReportingMetaDataState(metaData);
			return metaData;
		});
	};

	getComputedSitesData = top10Sites => {
		const selectedSite = this.getSelectedSite(top10Sites);
		const stateObject = { top10Sites, selectedSite };

		return stateObject;
	};

	getAllErrorCodes = metaData => {
		const {
			filter: {
				error_code: { path }
			}
		} = metaData;
		const getData = this.getAllErrorCodesData(path).catch(() => {
			const stateObject = { errorCodeConfig: [] };

			return this.setComputedState(stateObject);
		});

		return getData;
	};

	getAllErrorCodesData = path => {
		const params = { isSuperUser: true };
		const { sites, associatedSites } = this.props;

		if (associatedSites.length) {
			// first filter out associated sites then get top10
			params.siteid = [...Object.keys(sites), ...associatedSites].join(',');
		}

		return reportService.getWidgetData({ path, params }).then(widgetData => {
			const {
				data: { result }
			} = widgetData;
			const stateObject = { errorCodeConfig: result };

			return this.setComputedState(stateObject);
		});
	};

	getAllModes = metaData => {
		const {
			filter: {
				mode: { path }
			}
		} = metaData;
		const getData = this.getAllModesData(path).catch(() => {
			const stateObject = { modeConfig: [] };

			return this.setComputedState(stateObject);
		});

		return getData;
	};

	getAllModesData = path => {
		const params = { isSuperUser: true };
		const { sites, associatedSites } = this.props;
		if (associatedSites.length) {
			// first filter out associated sites then get top10
			params.siteid = [...Object.keys(sites), ...associatedSites].join(',');
		}

		return reportService.getWidgetData({ path, params }).then(widgetData => {
			const {
				data: { result }
			} = widgetData;
			const stateObject = { modeConfig: result };

			return this.setComputedState(stateObject);
		});
	};

	getTop10Sites = metaData => {
		const path = this.getTop10SitesWidgetPath(metaData);
		const getData = this.getTop10SitesData(path, DEFAULT_DATE)
			.then(this.setComputedState)
			.catch(() => {
				const stateObject = this.getComputedSitesData([]);

				return this.setComputedState(stateObject);
			});

		return getData;
	};

	getTop10SitesWidgetPath = metaData => {
		const { widget: inputWidget } = metaData || {};
		const {
			widget: reportWidget,
			widgetsName: { OPS_TOP_SITES }
		} = this.props;
		const computedWidget = inputWidget || reportWidget;
		const {
			[OPS_TOP_SITES]: { path }
		} = computedWidget;

		return path;
	};

	getTop10SitesData = (path, selectedDate) => {
		const params = { ...getDateRange(selectedDate), isSuperUser: true };

		return reportService
			.getWidgetData({ path, params })
			.then(({ data }) => this.getTopSitesWidgetTransformedData(data))
			.then(this.reduceTopSitesDataToArray)
			.then(this.getComputedSitesData);
	};

	getTopPerformingSites = (allUserSites, reportingSites) => {
		let topPerformingSite;
		let maxPageCPM = 0;

		allUserSites.forEach(site => {
			const siteId = site.value;
			const reportingSite = reportingSites[siteId];

			if (
				reportingSite &&
				reportingSite.adpushup_page_cpm &&
				reportingSite.adpushup_page_cpm > maxPageCPM
			) {
				topPerformingSite = siteId;
				maxPageCPM = reportingSite.adpushup_page_cpm;
				return topPerformingSite;
			}

			return true;
		});

		return topPerformingSite;
	};

	getReportTypeValidation = inputReportType => {
		const { reportType } = this.state;
		const computedReportType = inputReportType || reportType;
		const isReportTypeAccount = !!(computedReportType === 'account');
		const isReportTypeGlobal = !!(computedReportType === 'global');
		const isReportTypeSite = !!(computedReportType === 'site');
		const resultObject = { isReportTypeAccount, isReportTypeGlobal, isReportTypeSite };

		return resultObject;
	};

	getWebsiteWidgetValidation = widgetName => {
		const {
			widgetsName: { OPS_TOP_SITES, OPS_COUNTRY_REPORT, OPS_NETWORK_REPORT }
		} = this.props;
		const isValid = !!(
			widgetName &&
			widgetName !== OPS_TOP_SITES &&
			widgetName !== OPS_COUNTRY_REPORT &&
			widgetName !== OPS_NETWORK_REPORT
		);

		return isValid;
	};

	getMetricWidgetValidation = widgetName => {
		const {
			widgetsName: { OPS_COUNTRY_REPORT, OPS_NETWORK_REPORT }
		} = this.props;
		const isValid = !!(
			widgetName &&
			(widgetName === OPS_COUNTRY_REPORT || widgetName === OPS_NETWORK_REPORT)
		);

		return isValid;
	};

	getTransformedWidgetMetricArray = widgetMetrics => {
		const { metrics } = this.state;
		const resultArray = [];

		widgetMetrics.forEach(metricName => {
			const metricLabel = metrics[metricName].display_name;

			resultArray.push({
				name: metricLabel,
				value: metricName,
				position: metrics[metricName].table_position
			});
		});

		return sortBy(resultArray, o => o.position);
	};

	getWidgetConfig = (widgets, widgetsList) => {
		const {
			widgetsName: {
				PER_AP_ORIGINAL,
				OPS_TOP_SITES,
				OPS_COUNTRY_REPORT,
				OPS_NETWORK_REPORT,
				OPS_ERROR_REPORT
			}
		} = this.props;
		const sortedWidgets = sortBy(widgets, ['position', 'name']);
		const widgetsConfig = [];
		const { top10Sites: sitesList, selectedSite, modeConfig, errorCodeConfig } = this.state;

		Object.keys(sortedWidgets).forEach(wid => {
			const widget = { ...sortedWidgets[wid] };
			const websiteWidgetValidated = this.getWebsiteWidgetValidation(widget.name);

			if (widgetsList.indexOf(widget.name) > -1) {
				widget.isLoading = true;
				widget.selectedDate = DEFAULT_DATE;
				widget.isDataSufficient = false;
				widget.selectedSite = 'all';

				if (websiteWidgetValidated) widget.sitesList = sitesList;

				switch (widget.name) {
					case PER_AP_ORIGINAL:
						widget.selectedSite = selectedSite;
						widget.selectedDimension = 'page_variation_type';
						widget.selectedChartLegendMetric = 'adpushup_page_cpm';
						break;

					case OPS_TOP_SITES:
						widget.selectedDimension = 'siteid';
						break;

					case OPS_COUNTRY_REPORT:
						widget.selectedDimension = 'country';
						widget.selectedMetric = 'adpushup_page_views';
						widget.chartLegend = 'Country';
						widget.chartSeriesLabel = 'country';
						widget.chartSeriesMetric = 'adpushup_page_views';
						widget.chartSeriesMetricType = 'number';
						widget.path += `&metrics=adpushup_page_views`;
						break;

					case OPS_NETWORK_REPORT:
						widget.selectedDimension = 'network';
						widget.selectedMetric = 'network_net_revenue';
						widget.chartLegend = 'Network';
						widget.chartSeriesLabel = 'network';
						widget.chartSeriesMetric = 'network_net_revenue';
						widget.chartSeriesMetricType = 'money';
						widget.path += `&metrics=network_net_revenue`;
						break;

					case OPS_ERROR_REPORT:
						widget.selectedDimension = 'mode';
						widget.modeData = modeConfig;
						widget.errorCodeData = errorCodeConfig;
						break;

					default:
				}

				widgetsConfig.push(widget);
			}
		});

		return widgetsConfig;
	};

	getWidgetComponent = widget => {
		const {
			widgetsName: {
				ESTIMATED_EARNINGS,
				PER_AP_ORIGINAL,
				PER_OVERVIEW,
				OPS_TOP_SITES,
				OPS_COUNTRY_REPORT,
				OPS_NETWORK_REPORT,
				OPS_ERROR_REPORT
			},
			isForOps
		} = this.props;
		const { reportType } = this.state;
		let computedWidgetData;

		if (widget.isLoading) return <Loader height="20vh" />;

		switch (widget.name) {
			case ESTIMATED_EARNINGS:
				return (
					<EstimatedEarningsContainer
						reportType={reportType}
						displayData={widget.data}
						isForOps={isForOps}
					/>
				);

			case PER_AP_ORIGINAL:
				return (
					<PerformanceApOriginalContainer
						reportType={reportType}
						displayData={widget.data}
						isDataSufficient={widget.isDataSufficient}
						isForOps={isForOps}
					/>
				);

			case PER_OVERVIEW:
				return (
					<PerformanceOverviewContainer
						reportType={reportType}
						displayData={widget.data}
						isForOps={isForOps}
					/>
				);
			case OPS_TOP_SITES:
				computedWidgetData = this.getTopSitesWidgetTransformedData(widget.data);
				return (
					<SitewiseReportContainer
						reportType={reportType}
						disableSiteLevelCheck
						displayData={computedWidgetData}
						isForOps={isForOps}
					/>
				);

			case OPS_COUNTRY_REPORT:
			case OPS_NETWORK_REPORT:
				return (
					<RevenueContainer reportType={reportType} displayData={widget} isForOps={isForOps} />
				);

			case OPS_ERROR_REPORT:
				return (
					<ModeReportContainer reportType={reportType} displayData={widget} isForOps={isForOps} />
				);

			default:
		}

		return false;
	};

	getDisplayData = wid => {
		const { widgetsConfig, reportingSites } = this.state;
		const { isReportTypeAccount, isReportTypeGlobal } = this.getReportTypeValidation();
		const {
			selectedDate,
			selectedSite,
			selectedMetric,
			path,
			name,
			customDateRange,
			startDate,
			endDate
		} = widgetsConfig[wid];
		const {
			sites,
			widgetsName: { PER_AP_ORIGINAL },
			globalReportMetaData,
			associatedSites,
			isForOps
		} = this.props;

		const metaData = globalReportMetaData;
		const siteIds = Object.keys(sites);
		let params = getDateRange(selectedDate);
		if (customDateRange) {
			params = {
				fromDate: moment(startDate).format('YYYY-MM-DD'),
				toDate: moment(endDate).format('YYYY-MM-DD')
			};
		}

		const isWidgetNamePerAPOriginal = !!(name === PER_AP_ORIGINAL);
		const hidPerApOriginData =
			isReportTypeAccount &&
			isWidgetNamePerAPOriginal &&
			reportingSites &&
			reportingSites[selectedSite] &&
			reportingSites[selectedSite].dataAvailableOutOfLast30Days < 21;
		const isMetricWidget = this.getMetricWidgetValidation(name);
		const computedWidgetPath = isMetricWidget
			? path.replace(/&metrics=\w+/, `&metrics=${selectedMetric}`)
			: path;
		const isValidSelectedSite = !!selectedSite;
		const isValidAllSelectedSites = !!(isValidSelectedSite && selectedSite === 'all');

		params.siteid = isValidAllSelectedSites ? siteIds.toString() : selectedSite;

		if (isForOps) {
			// this flag is now mandatory for fetching gross_revenue
			params.isSuperUser = true;
		}

		if (isReportTypeGlobal && (!isValidSelectedSite || isValidAllSelectedSites)) {
			params.isSuperUser = true;
			// restrict the access in global reports for Ops team members
			// allow accounts associated with the user only in the global reports
			if (associatedSites.length) {
				params.siteid = [...siteIds, ...associatedSites].join(',');
			} else {
				delete params.siteid;
			}
		}

		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;
		const validReportParams = !!(params.siteid || params.isSuperUser);

		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
		} else if (validReportParams) {
			const widgetSitesList = widgetsConfig[wid].sitesList;
			const isValidSiteList = !!(widgetSitesList && widgetSitesList.length);
			const websiteWidgetValidated = this.getWebsiteWidgetValidation(widgetsConfig[wid].name);
			const shouldFetchWidgetTopSites = !!(
				isReportTypeGlobal &&
				!isValidSiteList &&
				websiteWidgetValidated
			);
			const top10SitesWidgetPath = shouldFetchWidgetTopSites
				? this.getTop10SitesWidgetPath(metaData.data)
				: '';
			const getTop10SitesData = shouldFetchWidgetTopSites
				? this.getTop10SitesData(top10SitesWidgetPath, selectedDate)
				: Promise.resolve(this.getComputedSitesData(widgetSitesList || []));
			const getWidgetData = reportService.getWidgetData({ path: computedWidgetPath, params });

			return Promise.all([getTop10SitesData, getWidgetData])
				.then(responseData => {
					const [{ top10Sites, selectedSite: computedSelectedSite }, response] = responseData;

					if (
						response.status === 200 &&
						!isEmpty(response.data) &&
						response.data.result &&
						response.data.result.length > 0
					) {
						widgetsConfig[wid].data = response.data;
						widgetsConfig[wid].isDataSufficient = true;
						widgetsConfig[wid].sitesList = top10Sites;

						const isEmptySiteForApOriginalWidget = !!(isWidgetNamePerAPOriginal && !selectedSite);

						if (isEmptySiteForApOriginalWidget) {
							widgetsConfig[wid].selectedSite = computedSelectedSite;
						}
					} else {
						widgetsConfig[wid].data = {};
						widgetsConfig[wid].isDataSufficient = false;
					}

					widgetsConfig[wid].isLoading = false;
					return this.setState({ widgetsConfig });
				})
				.catch(() => {
					widgetsConfig[wid].isLoading = false;
					widgetsConfig[wid].data = {};
					widgetsConfig[wid].isDataSufficient = false;
					return this.setState({ widgetsConfig });
				});
		} else {
			widgetsConfig[wid].data = {};
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
		}

		return this.setState({ widgetsConfig });
	};

	getLayoutSites = (allUserSites, reportingSites) => {
		const layoutSites = [];
		allUserSites.forEach(site => {
			const siteId = site.value;
			const reportingSite = reportingSites[siteId];
			if (reportingSite && reportingSite.product && reportingSite.product.Layout === 1) {
				layoutSites.push(site);
			}
		});
		return layoutSites;
	};

	getTopSitesWidgetTransformedData = displayData => {
		const { associatedSites, sites } = this.props;
		const computedData = cloneDeep(displayData);
		// set cols to display
		// eslint-disable-next-line prefer-const
		let { columns = [], result = [] } = computedData;
		if (associatedSites.length) {
			// first filter out associated sites then get top10
			const siteListToFilterOut = [...Object.keys(sites), ...associatedSites].join(',');
			result = result.filter(item => siteListToFilterOut.includes(item.siteid));
		}
		computedData.columns = columns.filter(col => TOP_TEN_SITE_WIDGETS_COLUMNS.includes(col));
		computedData.result = orderBy(result, ['network_net_revenue'], ['desc']).slice(0, 10);

		return computedData;
	};

	reduceTopSitesDataToArray = resultData =>
		resultData.result.reduce(
			(accumulator, object) => {
				const item = {
					name: object.siteName,
					value: String(object.siteid)
				};

				accumulator.push(item);
				return accumulator;
			},
			[ALL_SITES_VALUE]
		);

	getSelectedSite = inputSites => {
		const { reportingSites } = this.state;
		const { sites, selectedSite } = this.state;
		const { isReportTypeGlobal, isReportTypeAccount } = this.getReportTypeValidation();
		const isValidInputSites = !!(inputSites && inputSites.length);
		const isValidReportingSites = !!(reportingSites && Object.keys(reportingSites).length);
		const shouldSetSiteForGlobalReport = !!(isReportTypeGlobal && isValidInputSites);
		const shouldSetSiteForAccountReport = !!(isReportTypeAccount && isValidReportingSites);
		let computedSite = selectedSite;

		if (shouldSetSiteForGlobalReport) {
			computedSite = inputSites[1].value;
		} else if (shouldSetSiteForAccountReport) {
			computedSite = this.getTopPerformingSites(sites, reportingSites) || '';
		}

		return computedSite;
	};

	setComputedState = (state, callback) => this.setState(state, callback || (() => {}));

	setReportingMetaData = metaData => {
		const { updateGlobalReportMetaData, updateSuperUserAccountReportMetaData } = this.props;

		const { reportType } = this.state;

		if (reportType === 'account') {
			updateSuperUserAccountReportMetaData(metaData);
		} else {
			updateGlobalReportMetaData(metaData);
		}
	};

	setReportingMetaDataState = metaData => {
		const { site = {}, widget, metrics } = metaData;
		const computedState = {
			reportingSites: site,
			widget,
			metrics
		};

		return this.setComputedState(computedState);
	};

	showApBaselineWidget = () => {
		const { siteId } = this.props;
		const {
			isReportTypeGlobal,
			isReportTypeSite,
			isReportTypeAccount
		} = this.getReportTypeValidation();
		const { sites, reportingSites } = this.state;
		const hasUserSiteProductLayout = !!(
			isReportTypeSite &&
			reportingSites &&
			reportingSites[siteId] &&
			reportingSites[siteId].product &&
			Number(reportingSites[siteId].product.Layout) === 1
		);

		if (isReportTypeGlobal || hasUserSiteProductLayout) {
			return true;
		}
		if (isReportTypeAccount) {
			const hasLayoutSite = this.getLayoutSites(sites, reportingSites);
			if (hasLayoutSite.length > 0) return true;
		}

		return false;
	};

	renderAsyncReportState = state =>
		new Promise(resolve => this.setComputedState({ ...state, isLoading: false }, () => resolve()));

	renderReportsUI = () =>
		this.getComputedMetaData()
			.then(() => {
				const { top10Sites } = this.state;

				return this.getComputedSitesData(top10Sites);
			})
			.then(({ selectedSite }) => this.renderAsyncReportState({ selectedSite }))
			.then(this.renderComputedWidgetsUI)
			.catch(this.rootErrorHandler);

	renderWidgetsUI = inputWidgetsConfig => {
		const { widgetsConfig } = this.state;
		const computedWidgetsConfig = inputWidgetsConfig || widgetsConfig;

		Object.keys(computedWidgetsConfig).forEach(wid => {
			this.getDisplayData(wid);
		});
	};

	renderComputedWidgetsUI = () => {
		const { widgetsList } = this.props;
		const { widget } = this.state;
		const widgetsConfig = this.getWidgetConfig(widget, widgetsList);

		this.setState({ widgetsConfig, isLoading: false }, () => this.renderWidgetsUI(widgetsConfig));
	};

	renderControl(wid) {
		const {
			widgetsName: { ESTIMATED_EARNINGS, PER_AP_ORIGINAL }
		} = this.props;
		const { widgetsConfig, quickDates, sites, reportingSites } = this.state;
		const { isReportTypeGlobal, isReportTypeSite } = this.getReportTypeValidation();
		const {
			selectedDate,
			selectedSite,
			selectedMetric,
			name,
			sitesList,
			metrics,
			customDateRange,
			focusedInput,
			startDate,
			endDate
		} = widgetsConfig[wid];
		const layoutSites = reportingSites ? this.getLayoutSites(sites, reportingSites) : [];
		const isWidgetNamePerAPOriginal = !!(name === PER_AP_ORIGINAL);
		const shouldShowQuickDatesWidget = !!(name !== ESTIMATED_EARNINGS);
		const websiteWidgetValidated = this.getWebsiteWidgetValidation(name);
		const shouldShowWebsiteWidget = !!(!isReportTypeSite && websiteWidgetValidated);
		const shouldShowMetricWidget = this.getMetricWidgetValidation(name);
		const computedWidgetMetrics = shouldShowMetricWidget
			? this.getTransformedWidgetMetricArray(metrics)
			: [];
		let sitesToShow = isWidgetNamePerAPOriginal ? layoutSites : sites;
		const shouldSetGlobalSites = !!(isReportTypeGlobal && sitesList && websiteWidgetValidated);

		const handleCustomDateChange = () => {
			widgetsConfig[wid].startDate = startDate;
			widgetsConfig[wid].endDate = endDate;
			/*	
				setting state only when focusedInput='endDate', that is when
				the user selects the endDate and the date-picker closes,
				otherwise selecting startDate would cause re-render
				which in not required
			*/
			if (startDate && endDate && focusedInput === 'endDate') {
				widgetsConfig[wid].isLoading = true;
				widgetsConfig[wid].sitesList = [];
				this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
			}
		};

		const handleDatePresetSelect = selection => {
			widgetsConfig[wid].selectedDate = selection;

			if (selection === 'customDateRange') {
				widgetsConfig[wid].customDateRange = true;
				return this.setState({ widgetsConfig });
			}

			widgetsConfig[wid].sitesList = [];
			widgetsConfig[wid].isLoading = true;
			widgetsConfig[wid].customDateRange = false;
			this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
		};

		const handleFocusUpdate = focusedInput => {
			widgetsConfig[wid].focusedInput = focusedInput;
			this.setState({ widgetsConfig });
		};

		const filterDates = day =>
			day.isAfter(moment()) ||
			day.isBefore(
				moment()
					.startOf('month')
					.set({ year: 2019, month: 7 })
			);

		if (shouldSetGlobalSites) sitesToShow = sitesList.concat([]);

		const shouldHideControls = false;

		return shouldHideControls ? null : (
			<div className="aligner aligner--hEnd">
				{shouldShowMetricWidget ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Metrics</label>
						<SelectBox
							id={`metric-selectbox-${name}`}
							isClearable={false}
							pullRight
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedMetric}
							options={computedWidgetMetrics}
							onSelect={metric => {
								widgetsConfig[wid]['selectedMetric'] = metric;
								widgetsConfig[wid]['chartSeriesMetric'] = metric;
								widgetsConfig[wid].isLoading = true;
								this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
							}}
						/>
					</div>
				) : (
					''
				)}

				{shouldShowQuickDatesWidget ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<SelectBox
							id={`date-selectbox-${name}`}
							wrapperClassName="display-inline"
							pullRight
							isClearable={false}
							isSearchable={false}
							selected={selectedDate}
							options={quickDates}
							onSelect={handleDatePresetSelect}
						/>

						{/* eslint-enable */}
					</div>
				) : (
					''
				)}

				{customDateRange && (
					<div className="u-margin-r4 display-inline">
						<div className="display-inline">
							{/* eslint-enable */}
							<DateRangePicker
								startDate={moment(startDate)}
								endDate={moment(endDate)}
								onDatesChange={handleCustomDateChange}
								/*
									data prior to 1st Aug, 2019 is present in the old console 
									therefore disabling dates before 1st Aug, 2019
								*/
								isOutsideRange={filterDates}
								focusedInput={focusedInput}
								onFocusChange={handleFocusUpdate}
								showDefaultInputIcon
								hideKeyboardShortcutsPanel
								minimumNights={0}
								displayFormat="DD-MM-YYYY"
							/>
						</div>
					</div>
				)}

				{shouldShowWebsiteWidget ? (
					<div className="">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Website</label>
						<SelectBox
							id={`site-selectbox-${name}`}
							isClearable={false}
							pullRight
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedSite}
							options={sitesToShow}
							onSelect={site => {
								widgetsConfig[wid]['selectedSite'] = site;
								widgetsConfig[wid].isLoading = true;
								this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
							}}
						/>

						{/* eslint-enable */}
					</div>
				) : (
					''
				)}
			</div>
		);
	}

	renderViewReportButton(wid) {
		const { widgetsConfig } = this.state;
		const {
			startDate,
			endDate,
			selectedSite,
			selectedDimension = '',
			selectedChartLegendMetric = '',
			isDataSufficient
		} = widgetsConfig[wid];
		const { siteId } = this.props;
		const {
			isReportTypeSite,
			isReportTypeAccount,
			isReportTypeGlobal
		} = this.getReportTypeValidation();
		const { ACCOUNT, GLOBAL } = REPORT_LINK;

		let siteSelected = '';
		let computedReportLinkRoute = '';

		if (isReportTypeGlobal) {
			computedReportLinkRoute = GLOBAL;
		} else if (isReportTypeAccount) {
			computedReportLinkRoute = ACCOUNT;
		}

		if (isReportTypeSite) siteSelected = `/${siteId}`;
		else if (selectedSite !== 'all') siteSelected = `/${selectedSite}`;

		const computedReportLink = `/admin-panel/info-panel/${computedReportLinkRoute}${siteSelected}?fromDate=${startDate}&toDate=${endDate}&dimension=${selectedDimension}&chartLegendMetric=${selectedChartLegendMetric}`;

		return (
			<Link to={computedReportLink} className="u-link-reset aligner aligner-item float-right">
				<Button className="aligner-item aligner aligner--vCenter" disabled={!isDataSufficient}>
					View Reports
					<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
				</Button>
			</Link>
		);
	}

	renderHeader = () => {
		const ref = this;
		const { reportType } = ref.state;
		const options = [
			{ name: 'Account', value: 'account' },
			{ name: 'Global', value: 'global' }
		];

		return (
			<div
				key={`header-report-${reportType}`}
				className="aligner aligner--row aligner--vCenter u-margin-b4"
			>
				<span className="aligner-item u-text-bold">Key Vitals</span>
				<div className="aligner aligner--hEnd aligner--vCenter">
					<b className="u-margin-r3">Report Level</b>
					<SelectBox
						id="header-selectbox"
						isClearable={false}
						pullRight
						isSearchable={false}
						wrapperClassName="display-inline"
						selected={reportType}
						options={options}
						onSelect={item =>
							ref.setState({ isLoading: true, reportType: item }, () => ref.renderReportsUI())
						}
					/>
				</div>
			</div>
		);
	};

	renderContent = () => {
		const { widgetsConfig } = this.state;
		const headerComponent = this.renderHeader();
		const content = [headerComponent];
		const hasLayoutSite = this.showApBaselineWidget();

		Object.keys(widgetsConfig).forEach(wid => {
			const widget = widgetsConfig[wid];
			const widgetComponent = this.getWidgetComponent(widget);
			const isValidWidget = !!(
				(widget.name === 'per_ap_original' && hasLayoutSite) ||
				widget.name !== 'per_ap_original'
			);

			if (isValidWidget) {
				content.push(
					<Card
						rootClassName={
							widget.name === 'estimated_earnings'
								? 'u-margin-b4 width-100 card-color'
								: 'u-margin-b4 width-100'
						}
						key={widget.name}
						type="default"
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">{widget.display_name}</span>
								{this.renderControl(wid)}
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={widgetComponent}
						footerClassName="card-footer"
						footerChildren={
							widget.name !== 'estimated_earnings' ? this.renderViewReportButton(wid) : <span />
						}
					/>
				);
			}
		});
		content.splice(4, 0, content.pop());

		return content;
	};

	render() {
		const { isLoading, isLoadingError } = this.state;

		if (isLoading) {
			return <Loader />;
		}

		if (isLoadingError) {
			return (
				<Empty message="Error occurred while loading QuickSnapshot reports. Please check after some time." />
			);
		}

		return <Fragment>{this.renderContent()}</Fragment>;
	}
}

export default QuickSnapshot;
