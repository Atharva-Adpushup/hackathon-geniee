import React, { Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { Button, Glyphicon } from '@/Client/helpers/react-bootstrap-imports';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import pullAll from 'lodash/pullAll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from '../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../containers/PerformanceOverviewContainer';
import VideoAdRevenueContainer from '../containers/VideoAdRevenueContainer';
import PerformanceApOriginalContainer from '../containers/PerformanceApOriginalContainer';
import PeerPerformanceOverviewContainer from '../containers/PeerPerformanceOveriewContainer';
import RevenueContainer from '../containers/RevenueContainer';
import TopURLContainer from '../containers/TopURLContainer';
import TopUTMContainer from '../containers/TopUTMContainer';
import AdsTxtStatusContainer from '../containers/AdsTxtStatusContainer';
import CoreWebVitalsContainer from '../containers/CoreWebVitalsContainer';
import VisitorDataContainer from '../containers/VisitorDataContainer';
import PaymentHistoryContainer from '../containers/PaymentHistoryContainer';
import GaStatsContainer from '../containers/GaStatsContainer';
import AsyncGroupSelect from '../../../Components/AsyncGroupSelect';
import axiosInstance from '../../../helpers/axiosInstance';

import {
	API,
	GA_REPORT_FILTER_LIST,
	dates,
	toggleableWidgets,
	DEVICE_OPTIONS,
	GA_REPORTS,
	DIMENSIONS_SUPPORTED
} from '../configs/commonConsts';

import proxyService from '../../../services/proxyService';

import Loader from '../../../Components/Loader/index';
import {
	getDashboardDemoUserSiteIds,
	checkDemoUserEmail,
	getDemoUserSites,
	getOnboardingTemplateData
} from '../../../helpers/commonFunctions';

import SelectBox from '../../../Components/SelectBox/index';
import reportService from '../../../services/reportService';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import OnboardingCard from '../../../Components/OnboardingCard';
import CustomButton from '../../../Components/CustomButton';
import MixpanelHelper from '../../../helpers/mixpanel';
import config from '../../../config/config';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		const {
			user: {
				data: { isUniqueImpEnabled = false }
			}
		} = props;

		this.state = {
			quickDates: dates,
			sites: [],
			widgetsConfig: [],
			isLoading: true,
			isUniqueImpEnabled,
			initialLoadingStarted: new Date().getTime(),
			loadCounter: 0,
			coreWebVitalsdata: {},
			selectedDevice: 'mobile',
			errMessage: '',
			countries: [],
			device_types: [],
			listOfGaReportDimensions: [],
			selectedGaReportDimension: null,
			dirty: false
		};
	}

	componentDidMount() {
		const {
			user: {
				data: { email }
			},
			sites,
			reportsMeta,
			updateAccountReportMetaData,
			fetchPeerPerformanceBlockedSite,
			peerPerformanceBlockedSitesFetched,
			peerPerformanceAnalysis
		} = this.props;
		let userSites = Object.keys(sites).toString();
		this.getGaReportDimensions();
		this.fetchDeviceList();
		this.fetchCountryList();
		userSites = getDashboardDemoUserSiteIds(userSites, email);

		if (peerPerformanceAnalysis && !peerPerformanceBlockedSitesFetched) {
			fetchPeerPerformanceBlockedSite();
		}

		if (!reportsMeta.fetched) {
			return reportService.getMetaData({ sites: userSites }).then(response => {
				let { data: computedData } = response;
				computedData = getDemoUserSites(computedData, email);

				updateAccountReportMetaData(computedData);

				return this.getContentInfo(computedData);
			});
		}

		return this.getContentInfo(reportsMeta.data);
	}

	componentDidUpdate(prepProps) {
		const { peerPerformanceblockedSites } = this.props;
		const { peerPerformanceblockedSites: previousPeerPerformanceblockedSites } = prepProps;
		const { widgetsConfig = [] } = this.state;
		if (
			peerPerformanceblockedSites.length !== 0 &&
			peerPerformanceblockedSites !== previousPeerPerformanceblockedSites
		) {
			const index = widgetsConfig.findIndex(widget => {
				const { name = '' } = widget;
				return name === 'peer_performance_report';
			});

			if (index !== -1) this.getDisplayData(index);
		}
	}

	getContentInfo = reportsMetaData => {
		const { reportType, siteId, widgetsList, sites } = this.props;
		const { site: reportingSites, widget } = reportsMetaData;
		const allUserSites = [{ name: 'All', value: 'all' }, ...convertObjToArr(sites)];
		const topPerformingSite = reportingSites
			? this.getTopPerformingSites(allUserSites, reportingSites)
			: null;

		const selectedSite = reportType === 'site' ? siteId : topPerformingSite || 'all';

		const widgetsConfig = this.getWidgetConfig(widget, selectedSite, reportType, widgetsList);
		this.setState(
			{
				sites: allUserSites,
				widgetsConfig,
				isLoading: false
			},
			() => {
				widgetsConfig.forEach((wid, index) => {
					this.getDisplayData(index);
				});
			}
		);
	};

	getTopPerformingSites = (allUserSites, reportingSites) => {
		let topPerformingSite;

		// eslint-disable-next-line consistent-return
		allUserSites.forEach(site => {
			const siteId = site.value;

			if (reportingSites[siteId] && reportingSites[siteId].isTopPerforming) {
				topPerformingSite = siteId;
				return topPerformingSite;
			}
		});

		return topPerformingSite;
	};

	shouldShowPrimisWidget = widgetsList => {
		const PRIMIS_REPORT = 'primis_report';
		const VIDEO_ADS_DASHBOARD = 'videoAdsDashboard';
		const {
			user: {
				data: { sites }
			}
		} = this.props;
		let showWidget = false;
		Object.keys(sites).map(site => {
			const { product = {} } = sites[site];
			showWidget = showWidget || !!product[VIDEO_ADS_DASHBOARD];
			return site;
		});

		if (!showWidget) {
			const index = widgetsList.indexOf(PRIMIS_REPORT);
			if (index !== -1) widgetsList.splice(index, 1, 0);
		}
	};

	shouldShowGaSessionDashboard = widgetsList => {
		const {
			user: {
				data: { activeProducts }
			}
		} = this.props;
		const showWidget = !!activeProducts && !!activeProducts[GA_REPORTS];

		if (!showWidget) {
			const index = widgetsList.indexOf('site_ga_session_stats');
			if (index !== -1) widgetsList.splice(index, 1, 0);
		}
	};

	getWidgetConfig = (widgets, selectedSite, reportType, widgetsList) => {
		const sortedWidgets = sortBy(widgets, ['position', 'name']);
		const widgetsConfig = [];
		const {
			user: {
				data: { sites }
			}
		} = this.props;

		this.shouldShowPrimisWidget(widgetsList);
		this.shouldShowGaSessionDashboard(widgetsList);

		Object.keys(sortedWidgets).forEach(wid => {
			const widget = { ...sortedWidgets[wid] };

			if (widgetsList.indexOf(widget.name) > -1) {
				widget.isLoading = true;
				widget.selectedDate = dates[2].value;
				widget.isDataSufficient = false;

				if (widget.name === 'top_url_report' || widget.name === 'top_utm_report') {
					// eslint-disable-next-line prefer-destructuring
					widget.selectedSite = Object.keys(sites)[0];
				} else if (reportType === 'site' || widget.name === 'per_ap_original')
					widget.selectedSite = selectedSite;
				else widget.selectedSite = 'all';

				if (widget.name === 'per_ap_original') {
					widget.selectedDimension = 'page_variation_type';
					widget.selectedChartLegendMetric = 'adpushup_page_cpm';
				}

				if (widget.name === 'rev_by_network') {
					widget.selectedDimension = 'network';
					widget.chartLegend = 'Revenue';
					widget.chartSeriesLabel = 'network';
					widget.chartSeriesMetric = 'revenue';
					widget.chartSeriesMetricType = 'money';
				}

				if (widget.name === 'per_site_wise' || widget.name === 'primis_report') {
					widget.selectedDimension = 'siteid';
				}

				if (widget.name === 'ops_country_report') {
					widget.selectedDimension = 'country';
					widget.chartLegend = 'Country';
					widget.chartSeriesLabel = 'country';
					widget.chartSeriesMetric = 'adpushup_page_views';
					widget.chartSeriesMetricType = 'number';
				}

				if (widget.name === 'peer_performance_report') {
					widget.chartLegend = 'Revenue';
					widget.chartSeriesLabel = 'revenue_channel';
					widget.chartSeriesMetric = 'network_net_revenue';
					widget.chartSeriesMetricType = 'money';
				}

				if (widget.name === 'ga_traffic_breakdown_by_country') {
					widget.selectedDimension = 'country';
					widget.chartLegend = 'Country';
					widget.chartSeriesLabel = 'name';
					widget.chartSeriesMetric = 'ga_page_views';
					widget.chartSeriesMetricType = 'number';
				}

				if (widget.name === 'ga_traffic_breakdown_by_channel') {
					widget.selectedDimension = 'traffic_channel';
					widget.chartLegend = 'Channel';
					widget.chartSeriesLabel = 'name';
					widget.chartSeriesMetric = 'ga_page_views';
					widget.chartSeriesMetricType = 'number';
				}

				if (widget.name === 'rev_by_device_type') {
					widget.selectedDimension = 'device_type';
					widget.chartLegend = 'Revenue';
					widget.chartSeriesLabel = 'device_type';
					widget.chartSeriesMetric = 'network_net_revenue';
					widget.chartSeriesMetricType = 'money';
				}

				if (widget.name === GA_REPORTS) {
					widget.params = widget.params || {};
					widget.params.report_name = 'site_ga_stats';
				}

				widgetsConfig.push(widget);
			}
		});
		if (reportType !== 'site') {
			widgetsConfig.push(
				{
					name: 'ads_txt_status',
					display_name: 'Ads.txt Status',
					isLoading: true
				},
				{
					name: 'payment_history',
					display_name: 'Payments',
					isLoading: true
				}
			);
		}

		if (reportType !== 'site' && config.isCoreWebVitalsEnabled) {
			// this check to be removed later
			widgetsConfig.push({
				name: 'core_web_vitals',
				display_name: 'Core Web Vitals',
				selectedSite: Object.keys(sites)[0],
				isLoading: true
			});
		}

		return widgetsConfig;
	};

	getWidgetComponent = widget => {
		const { reportType } = this.props;
		const { isUniqueImpEnabled, selectedGaReportDimension, dirty } = this.state;
		if (widget.isLoading) return <Loader height="20vh" />;

		switch (widget.name) {
			case 'estimated_earnings':
				return <EstimatedEarningsContainer displayData={widget.data} />;
			case 'per_ap_original':
				return (
					<PerformanceApOriginalContainer
						displayData={widget.data}
						isDataSufficient={widget.isDataSufficient}
					/>
				);
			case 'per_overview':
				return (
					<PerformanceOverviewContainer
						isUniqueImpEnabled={isUniqueImpEnabled}
						displayData={widget.data}
					/>
				);
			case 'per_site_wise':
				if (reportType !== 'site') {
					return <SitewiseReportContainer displayData={widget.data} />;
				}
				return '';
			case 'primis_report':
				if (reportType !== 'site') {
					return <VideoAdRevenueContainer displayData={widget.data} />;
				}
				return '';
			case 'per_site_wise_daily':
				if (reportType === 'site') {
					return <SitewiseReportContainer displayData={widget.data} reportType="site" />;
				}
				return '';
			case 'rev_by_network':
				return <RevenueContainer displayData={widget} />;

			case 'ops_country_report':
				return <RevenueContainer displayData={widget} reportType="site" />;
			case 'peer_performance_report':
				return (
					<PeerPerformanceOverviewContainer
						displayData={widget}
						isDataSufficient={widget.isDataSufficient}
					/>
				);

			case 'top_url_report':
				if (reportType !== 'site') {
					return <TopURLContainer displayData={widget.data} />;
				}
				return '';
			case 'top_utm_report':
				if (reportType !== 'site') {
					return <TopUTMContainer displayData={widget.data} />;
				}
				return '';

			case 'rev_by_device_type':
				return <RevenueContainer displayData={widget} />;

			case 'ads_txt_status':
				return <AdsTxtStatusContainer displayData={widget.data} />;

			case 'payment_history':
				return <PaymentHistoryContainer displayData={widget.data} />;

			case 'core_web_vitals':
				return <CoreWebVitalsContainer displayData={widget.data} />;

			case 'site_ga_stats':
				if (reportType !== 'site') {
					return <VisitorDataContainer displayData={widget.data} />;
				}
				return '';

			case 'ga_traffic_breakdown_by_country':
				return <RevenueContainer displayData={widget} />;

			case 'ga_traffic_breakdown_by_channel':
				return <RevenueContainer displayData={widget} />;
			case GA_REPORTS:
				return (
					<GaStatsContainer
						displayData={widget.data}
						dirty={dirty || false}
						selectedDimension={selectedGaReportDimension}
					/>
				);
			default:
		}
	};

	logApiResponseTime = initialLoadingStarted => {
		const finalTime = new Date().getTime();
		const responseLoadTime = finalTime - initialLoadingStarted;
		const properties = {
			componentName: 'Dashboard',
			responseLoadTime,
			group: 'componentApiLoadMonitoring'
		};
		MixpanelHelper.trackEvent('Performance', properties);
	};

	getSitesAdstxtStatus = (wid, userSites) => {
		const { widgetsConfig } = this.state;

		const statusText = {
			204: 'No Ads.txt present',
			206: 'Some Entries are missing'
		};

		const promiseSerial = funcs =>
			funcs.reduce(
				(promise, obj) =>
					promise.then(all => {
						const { func, siteid } = obj;
						return func()
							.then(() => {
								const result = {
									domain: React.cloneElement(
										<a href={`/reports/${siteid}`}>{userSites[siteid].siteDomain}</a>
									),
									ourAdsTxtStatus: 'Entries Upto Date',
									isComplete: true
								};
								return all.concat(result);
							})
							.catch(error => {
								let result = {
									isComplete: false,
									domain: React.cloneElement(
										<a href={`/reports/${siteid}`}>{userSites[siteid].siteDomain}</a>
									)
								};

								if (error.response) {
									const errorResponse = error.response.data;

									if (error.response.status === 400) {
										const { error: errors } = errorResponse;

										for (let index = 0; index < errors.length; index += 1) {
											const { error: err, type, code } = errors[index];

											if (type === 'ourAdsTxt') {
												result.ourAdsTxtStatus = statusText[code];
											} else {
												result.ourAdsTxtStatus = err;
											}
										}
									} else if (error.response.status === 404) {
										const { ourAdsTxt: ourAdsTxtError } = errorResponse.error;

										result = {
											...result,
											ourAdsTxtStatus: ourAdsTxtError
										};
									} else {
										result = {
											...result,
											ourAdsTxtStatus: errorResponse.error
										};
									}
								} else {
									result = {
										...result,
										ourAdsTxtStatus: 'Something went wrong!'
									};
								}

								return all.concat(result);
							});
					}),
				Promise.resolve([])
			);
		const funcs = Object.keys(userSites).map(siteid => ({
			func: () => proxyService.verifyAdsTxtCode(userSites[siteid].siteDomain, siteid),
			siteid
		}));

		return promiseSerial(funcs)
			.then(res => {
				widgetsConfig[wid].data = res;
				widgetsConfig[wid].isLoading = false;
				widgetsConfig[wid].isDataSufficient = true;
				if (widgetsConfig.name === GA_REPORTS) {
					this.setState({ widgetsConfig, dirty: false });
				} else {
					this.setState({ widgetsConfig });
				}
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
				widgetsConfig[wid].isLoading = false;

				this.setState({ widgetsConfig });
			});
	};

	getPaymentHistory = (wid, sellerId) => {
		const { widgetsConfig } = this.state;

		return reportService
			.getPaymentHistory({ sellerId })
			.then(res => {
				const { data = [] } = res;

				if (res.status === 200 && !isEmpty(data)) {
					widgetsConfig[wid].data = data;
					widgetsConfig[wid].isDataSufficient = true;
				} else {
					widgetsConfig[wid].data = {};
					widgetsConfig[wid].isDataSufficient = false;
				}
				widgetsConfig[wid].isLoading = false;

				this.setState({ widgetsConfig });
			})
			.catch(() => {
				widgetsConfig[wid].isLoading = false;
				this.setState({ widgetsConfig });
			});
	};

	getWebVitalsData = (wid, device, domain, siteId) => {
		const { widgetsConfig } = this.state;

		return reportService
			.getCorewebVitalsdata({ device, domain, siteId })
			.then(res => {
				const { data: { data = {} } = {} } = res;

				if (res.status === 200 && !isEmpty(data)) {
					widgetsConfig[wid].data = data;
					widgetsConfig[wid].isDataSufficient = true;
				} else {
					widgetsConfig[wid].data = {};
					widgetsConfig[wid].isDataSufficient = false;
				}
				widgetsConfig[wid].isLoading = false;

				this.setState({ widgetsConfig });
			})
			.catch(() => {
				widgetsConfig[wid].isLoading = false;
				this.setState({ widgetsConfig });
			});
	};

	getDisplayData = wid => {
		const { widgetsConfig = [], isUniqueImpEnabled, selectedDevice } = this.state;
		const { selectedDate, selectedSite, name, customDateRange, startDate, endDate } =
			widgetsConfig[wid] || {};
		let { path } = widgetsConfig[wid] || {};

		const {
			sites,
			reportsMeta,
			user: {
				data: { email, sellerId, activeProducts = {} }
			},
			peerPerformanceAnalysisSites,
			peerPerformanceAnalysis,
			peerPerformanceblockedSites,
			peerPerformanceBlockedSitesFetched
		} = this.props;

		let params;
		if (customDateRange) {
			params = {
				fromDate: moment(startDate).format('YYYY-MM-DD'),
				toDate: moment(endDate).format('YYYY-MM-DD')
			};
		} else {
			params = getDateRange(selectedDate);
		}
		const { site: reportingSites } = reportsMeta.data;

		const siteIds = Object.keys(sites);
		const hidPerApOriginData =
			name === 'per_ap_original' &&
			reportingSites &&
			reportingSites[selectedSite] &&
			reportingSites[selectedSite].dataAvailableOutOfLast30Days < 21;

		params.siteid = selectedSite === 'all' ? siteIds.toString() : selectedSite;
		params.siteid = getDashboardDemoUserSiteIds(params.siteid, email);
		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;

		if (name === 'payment_history' && activeProducts[name]) {
			return this.getPaymentHistory(wid, sellerId);
		}

		if (name === 'ads_txt_status' && activeProducts[name]) {
			return this.getSitesAdstxtStatus(wid, sites);
		}
		if (name === 'core_web_vitals' && activeProducts[name]) {
			return this.getWebVitalsData(
				wid,
				selectedDevice,
				sites[selectedSite].siteDomain,
				selectedSite
			);
		}

		if (name === 'per_site_wise' && isUniqueImpEnabled) {
			path = path.replace('network_impressions,', '');
			path = path.replace('network_ad_ecpm,', '');
			path += ',unique_impressions,unique_ad_ecpm';
		}

		if (name === 'peer_performance_report') {
			if (!peerPerformanceAnalysis || !peerPerformanceBlockedSitesFetched) return;
			const performanceSubscribedSites = peerPerformanceAnalysisSites.map(site => site.value);
			const performanceSubscribedExcludingBlocked = pullAll(
				performanceSubscribedSites,
				peerPerformanceblockedSites.map(site => site.toString())
			);
			params = { ...params, siteid: performanceSubscribedExcludingBlocked.join(',') };
		}

		if (name === GA_REPORTS && widgetsConfig[wid].params) {
			// eslint-disable-next-line prefer-destructuring
			Object.assign(params, widgetsConfig[wid].params);
		}

		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		} else if (
			(!toggleableWidgets.includes(name) && params.siteid) ||
			(toggleableWidgets.includes(name) && activeProducts[name] && params.siteid)
		) {
			reportService
				.getWidgetData({ path, params })
				.then(response => {
					this.setState(
						state => ({ ...state, loadCounter: state.loadCounter + 1 }),
						() => {
							const { initialLoadingStarted, loadCounter: apiLoadCounter } = this.state;
							if (apiLoadCounter === widgetsConfig.length) {
								this.logApiResponseTime(initialLoadingStarted);
							}
						}
					);
					if (
						// eslint-disable-next-line eqeqeq
						response.status === 200 &&
						!isEmpty(response.data) &&
						((response.data.result && response.data.result.length) || !response.data.result)
					) {
						widgetsConfig[wid].data = response.data;
						widgetsConfig[wid].isDataSufficient = true;
					} else {
						widgetsConfig[wid].data = {};
						widgetsConfig[wid].isDataSufficient = false;
					}

					widgetsConfig[wid].isLoading = false;
					this.setState({ widgetsConfig });
				})
				.catch(err => {
					// eslint-disable-next-line no-console
					console.log(err);
					widgetsConfig[wid].data = {};
					widgetsConfig[wid].isLoading = false;
					this.setState({ widgetsConfig });
				});
		} else {
			widgetsConfig[wid].data = {};
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		}
	};

	getLayoutSites = (allUserSites, reportingSites = {}) => {
		const layoutSites = [];
		allUserSites.forEach(site => {
			const siteId = site.value;
			const reportingSite = reportingSites[siteId];
			// eslint-disable-next-line eqeqeq
			if (reportingSite && reportingSite.product && reportingSite.product.Layout == 1) {
				layoutSites.push(site);
			}
		});
		return layoutSites;
	};

	fetchDeviceList = () => {
		axiosInstance.get(API.DEVICE_API).then(({ data }) => {
			this.setState({ device_types: data.result });
		});
	};

	fetchCountryList = () => {
		axiosInstance.get(API.COUNTRY_API).then(({ data }) => {
			this.setState({ countries: data.result });
		});
	};

	onGenerateGaReportButtonClick = wid => {
		// eslint-disable-next-line func-names
		this.setState({ dirty: false }, function() {
			const { sites } = this.props;
			const { widgetsConfig, selectedGaReportDimension } = this.state;
			const { selectedFilters } = widgetsConfig[wid];
			/**
			 * selectedFilters: {
			 *		country: {4: true, 12: true}
			 *		device_type: {2: true}
			 * }
			 */
			widgetsConfig[wid].isLoading = true;
			widgetsConfig[wid].params = widgetsConfig[wid].params || {};
			if (selectedGaReportDimension)
				widgetsConfig[wid].params.dimension = selectedGaReportDimension;
			if (selectedFilters) {
				Object.keys(selectedFilters).map(key => {
					const selectedSubCategoryFilters = Object.keys(selectedFilters[key]).toString();
					if (key === 'siteid' && !selectedSubCategoryFilters) {
						widgetsConfig[wid].params[key] = Object.keys(sites).toString();
					} else {
						widgetsConfig[wid].params[key] = selectedSubCategoryFilters;
					}
					return '';
				});
			} else {
				widgetsConfig[wid].params.siteid = Object.keys(sites).toString();
			}
			this.setState({ widgetsConfig });
			this.getDisplayData(wid);
		});
	};

	getGaReportDimensions = () => {
		let options = [];

		options = Object.keys(DIMENSIONS_SUPPORTED).map((key, i) => ({
			default_enabled: true,
			display_name: key,
			isDisabled: false,
			name: key,
			position: i + 1, // becaues array position starts with 0 & we want to set position atleast from 1
			value: DIMENSIONS_SUPPORTED[key]
		}));
		this.setState({ listOfGaReportDimensions: options });
	};

	getSelectedFilter = event =>
		new Promise((resolve, reject) => {
			let dynamicArray = [];
			// eslint-disable-next-line camelcase
			const { countries, device_types } = this.state;
			const response = { data: { result: [] }, status: 200 };
			const { key } = event;

			switch (key) {
				case 'country':
					dynamicArray = countries;
					break;
				case 'device_type':
					// eslint-disable-next-line camelcase
					dynamicArray = device_types;
					break;
				case 'siteid': {
					const { sites } = this.props;
					const siteIds = Object.keys(sites);
					dynamicArray = siteIds.map(siteId => ({
						id: siteId,
						value: siteId,
						name: sites[siteId].siteDomain
					}));
					break;
				}
				default:
					break;
			}

			// dynamicArray can be an array of either countries or device_types or siteIds
			response.data.result = dynamicArray.map(item => ({
				id: item.id,
				value: item.name || item.value,
				name: item.name || item.value,
				isDisabled: false
			}));

			return resolve(response);
		});

	showApBaselineWidget = () => {
		const {
			siteId,
			reportType,
			reportsMeta,
			user: {
				data: { email }
			}
		} = this.props;
		const { site: reportingSites } = reportsMeta.data;
		const { sites } = this.state;
		const isDemoUser = checkDemoUserEmail(email);
		const isLayoutProductInSiteReport = !!(
			reportType === 'site' &&
			reportingSites &&
			reportingSites[siteId] &&
			reportingSites[siteId].product &&
			Number(reportingSites[siteId].product.Layout) === 1
		);
		const isAccountLevelReport = !!(reportType === 'account');

		if (isLayoutProductInSiteReport || isDemoUser) {
			return true;
		}

		if (isAccountLevelReport) {
			const hasLayoutSite = this.getLayoutSites(sites, reportingSites);
			if (hasLayoutSite.length > 0) return true;
		}

		return false;
	};

	onCardHover = eventName => {
		const properties = { cardName: eventName, cardHovered: true };
		MixpanelHelper.trackEvent('Dashboard', properties);
	};

	handleDeviceSelect = (value, wid) => {
		const { sites, selectedSite } = this.state;

		const domain = sites.find(s => s.value === selectedSite).name;

		this.setState(
			{ selectedDevice: value },
			this.getWebVitalsData(wid, value, domain, selectedSite)
		);
	};

	handleFilterValueChange = (key, value, widgetsConfig, wid) => {
		widgetsConfig[wid][key] = value;
		this.setState({ widgetsConfig });
	};

	renderControl(wid) {
		const {
			reportType,
			reportsMeta,
			user: {
				data: { email }
			},
			showNotification
		} = this.props;

		const isDemoUser = checkDemoUserEmail(email);
		const { site: reportingSites } = reportsMeta.data;
		const {
			widgetsConfig,
			quickDates,
			sites,
			selectedDevice,
			selectedGaReportDimension,
			listOfGaReportDimensions
		} = this.state;
		const {
			selectedDate,
			selectedSite,
			selectedFilters = {},
			name,
			focusedInput,
			startDate,
			endDate
		} = widgetsConfig[wid];
		const layoutSites = reportingSites ? this.getLayoutSites(sites, reportingSites) : [];
		const isPerfApOriginalWidget = !!(name === 'per_ap_original');
		const isPerfApOriginalWidgetForDemoUser = !!(isDemoUser && isPerfApOriginalWidget);
		const computedSelectedSite = isPerfApOriginalWidgetForDemoUser ? sites[1].value : selectedSite;

		let sitesToShow = isPerfApOriginalWidget ? layoutSites : sites;
		const showFiltersWidget = [GA_REPORTS];
		const hideDateWidgets = [
			'estimated_earnings',
			'ads_txt_status',
			'core_web_vitals',
			'payment_history',
			GA_REPORTS
		];
		const hideWebsiteWidgets = [
			'per_site_wise',
			'peer_performance_report',
			'ads_txt_status',
			'payment_history',
			GA_REPORTS
		];

		const handleDatesChange = ({ startDate, endDate }) => {
			widgetsConfig[wid].startDate = startDate;
			widgetsConfig[wid].endDate = endDate;
			/*	
				setting state only when focusedInput='endDate', that is when
				the user selects the endDate and the date-picker closes,
				otherwise selecting startDate would cause re-render
				which in not required
			*/
			if (
				startDate &&
				endDate &&
				focusedInput === 'endDate' &&
				widgetsConfig[wid].name !== GA_REPORTS
			) {
				widgetsConfig[wid].isLoading = true;
				this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
			} else {
				this.setState({ widgetsConfig });
			}
		};

		const handleDatePresetSelect = selection => {
			const properties = {
				selection,
				cardName: widgetsConfig[wid].display_name
			};
			MixpanelHelper.trackEvent('Dashboard', properties);

			widgetsConfig[wid].selectedDate = selection;

			if (selection === 'customDateRange') {
				widgetsConfig[wid].customDateRange = true;
				return this.setState({ widgetsConfig });
			}
			widgetsConfig[wid].customDateRange = false;

			if (widgetsConfig[wid].name === GA_REPORTS) {
				this.setState({ widgetsConfig });
			} else {
				widgetsConfig[wid].isLoading = true;
				this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
			}
		};

		const handleFocusUpdate = focusedInput => {
			widgetsConfig[wid].focusedInput = focusedInput;
			this.setState({ widgetsConfig });
		};

		sitesToShow = isDemoUser ? sites : sitesToShow;

		return (
			<>
				{showFiltersWidget.indexOf(name) > -1 ? (
					<div className="aligner aligner--wrap aligner--hSpaceBetween  u-margin-t4 filterAndGenerateButtonRow gafilters">
						<div className="u-margin-r4 display-inline">
							<SelectBox
								id="performance-date"
								wrapperClassName="display-inline"
								pullRight
								isClearable={false}
								isSearchable={false}
								selected={selectedDate}
								options={quickDates}
								onSelect={handleDatePresetSelect}
							/>
						</div>

						{widgetsConfig[wid].customDateRange && (
							<div className="u-margin-r4 display-inline">
								<div className="display-inline">
									<DateRangePicker
										startDate={moment(startDate)}
										endDate={moment(endDate)}
										onDatesChange={handleDatesChange}
										/*
											data prior to 1st Aug, 2019 is present in the old console 
											therefore disabling dates before 1st Aug, 2019
										*/
										isOutsideRange={day =>
											day.isAfter(moment()) ||
											day.isBefore(
												moment()
													.startOf('month')
													.set({ year: 2019, month: 7 })
											)
										}
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
						<div className="reporting-filterBox aligner-item  aligner-item--grow5 asyncGroupSelect">
							<SelectBox
								isClearable={false}
								isSearchable={false}
								title="Select Dimension"
								wrapperClassName="custom-select-box-wrapper"
								reset
								selected={selectedGaReportDimension}
								options={listOfGaReportDimensions}
								onSelect={ev => this.setState({ selectedGaReportDimension: ev, dirty: true })}
							/>
						</div>
						<div className="reporting-filterBox aligner-item  aligner-item--grow5 u-margin-r4 asyncGroupSelect">
							<AsyncGroupSelect
								key="filter list"
								filterList={GA_REPORT_FILTER_LIST}
								selectedFilters={selectedFilters}
								onFilterValueChange={() =>
									this.handleFilterValueChange(
										'selectedFilters',
										selectedFilters,
										widgetsConfig,
										wid
									)
								}
								getSelectedFilter={this.getSelectedFilter}
								showNotification={showNotification}
							/>
						</div>
						<div className="aligner-item u-margin-r4 aligner--hEnd">
							<Button bsStyle="primary" onClick={() => this.onGenerateGaReportButtonClick(wid)}>
								<Glyphicon glyph="cog u-margin-r2" />
								Generate Report
							</Button>
						</div>
					</div>
				) : (
					''
				)}

				<div className="aligner aligner--hEnd">
					{hideDateWidgets.indexOf(name) === -1 ? (
						<div>
							<div className="u-margin-r4 display-inline">
								<SelectBox
									id="performance-date"
									wrapperClassName="display-inline"
									pullRight
									isClearable={false}
									isSearchable={false}
									selected={selectedDate}
									options={quickDates}
									onSelect={handleDatePresetSelect}
								/>
							</div>

							{widgetsConfig[wid].customDateRange && (
								<div className="u-margin-r4 display-inline">
									<div className="display-inline">
										<DateRangePicker
											startDate={moment(startDate)}
											endDate={moment(endDate)}
											onDatesChange={handleDatesChange}
											/*
											data prior to 1st Aug, 2019 is present in the old console 
											therefore disabling dates before 1st Aug, 2019
										*/
											isOutsideRange={day =>
												day.isAfter(moment()) ||
												day.isBefore(
													moment()
														.startOf('month')
														.set({ year: 2019, month: 7 })
												)
											}
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
						</div>
					) : (
						''
					)}
					{name === 'core_web_vitals' ? (
						<div className="u-margin-r4 display-inline">
							{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Device</label>
						<SelectBox
							id="performance-site"
							isClearable={false}
							pullRight
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedDevice}
							options={DEVICE_OPTIONS}
							onSelect={() => this.handleDeviceSelect(wid)}
							onSelect={device => {
								widgetsConfig[wid].isLoading = true;

								this.setState({ selectedDevice: device, widgetsConfig }, () =>
									this.getDisplayData(wid)
								);
							}}
						/>

						{/* eslint-enable */}
						</div>
					) : (
						''
					)}
					{reportType !== 'site' && hideWebsiteWidgets.indexOf(name) === -1 ? (
						<div className="">
							{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Website</label>
						<SelectBox
							id="performance-site"
							isClearable={false}
							pullRight
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={computedSelectedSite}
							options={
								name === 'core_web_vitals' || name === 'top_url_report' || name === 'top_utm_report'
									? sitesToShow.filter(site => site.value !== 'all')
									: sitesToShow
							}
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
			</>
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
			isDataSufficient,
			name
		} = widgetsConfig[wid];

		if (
			name === 'peer_performance_report' ||
			name === 'site_ga_stats' ||
			name === 'ga_traffic_breakdown_by_country' ||
			name === 'ga_traffic_breakdown_by_channel' ||
			name === GA_REPORTS
		)
			return null;
		const { reportType, siteId } = this.props;
		let siteSelected = '';

		if (reportType === 'site') siteSelected = `/${siteId}`;
		else if (selectedSite !== 'all') siteSelected = `/${selectedSite}`;

		let computedReportLink = `/reports${siteSelected}?fromDate=${startDate}&toDate=${endDate}&dimension=${selectedDimension}&chartLegendMetric=${selectedChartLegendMetric}`;

		if (name === 'top_url_report' || name === 'top_utm_report') {
			computedReportLink = `/reports/url-utm-analytics`;
		}
		if (name === 'ads_txt_status') {
			computedReportLink = '/adsTxtManagement';
		}
		if (name === 'payment_history') {
			computedReportLink = '/payment/history';
		}
		return (
			<Link to={computedReportLink} className="u-link-reset aligner aligner-item float-right">
				<Button className="aligner-item aligner aligner--vCenter" disabled={!isDataSufficient}>
					View Reports
					<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
				</Button>
			</Link>
		);
	}

	renderContent = () => {
		const { widgetsConfig } = this.state;
		const content = [];

		const hasLayoutSite = this.showApBaselineWidget();
		const { peerPerformanceAnalysis = false, activeProducts } = this.props;
		widgetsConfig.forEach((widget, index) => {
			// const widget = widgetsConfig[wid];
			if (
				(widget.name === 'peer_performance_report' && !peerPerformanceAnalysis) ||
				(toggleableWidgets.indexOf(widget.name) !== -1 && !activeProducts[widget.name])
			)
				return;
			const widgetComponent = this.getWidgetComponent(widget);
			if (
				(widget.name === 'per_ap_original' && hasLayoutSite) ||
				widget.name !== 'per_ap_original'
			) {
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
						onMouseEnter={() => this.onCardHover(widget.display_name)}
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">{widget.display_name}</span>
								{this.renderControl(index)}
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={widgetComponent}
						footerClassName="card-footer"
						footerChildren={
							widget.name !== 'estimated_earnings' ? this.renderViewReportButton(index) : <span />
						}
					/>
				);
			}
		});

		return content;
	};

	renderOnboardingCard() {
		const { user, reportType, siteId } = this.props;
		const userSites = user.data && user.data.sites ? user.data.sites : {};
		let site;

		if (reportType === 'site') site = userSites[siteId];
		else site = userSites[Object.keys(userSites)[0]];

		const { linkUrl, buttonText } = getOnboardingTemplateData(site);

		return (
			<OnboardingCard
				className="add-site-card"
				isActiveStep
				expanded
				count={1}
				imgPath="/assets/images/ob_add_site.png"
				heading="Complete Onboarding Setup"
				description="Please complete your site onboarding setup by clicking below."
			>
				<Link to={linkUrl} className="u-link-reset u-margin-t4 aligner aligner-item">
					<CustomButton>{buttonText}</CustomButton>
				</Link>
			</OnboardingCard>
		);
	}

	render() {
		const { sites, reportsMeta } = this.props;
		const { isLoading } = this.state;
		const isValidUserSites = Object.keys(sites).length;
		if (!reportsMeta.fetched || isLoading) {
			return <Loader />;
		}
		return (
			<Fragment> {isValidUserSites ? this.renderContent() : this.renderOnboardingCard()}</Fragment>
		);
	}
}

export default Dashboard;

/*
	Steps I followed to add the Country Widget on Dashboard
	-	Add the widget specific key to DashboardContainer's prop widgetsList in Client\Pages\Dashboard\index.js
	-	Add the config for the widget in the getWidgetConfig() here
	-	Add the component to be rendered for the widget in getWidgetComponent here
*/
