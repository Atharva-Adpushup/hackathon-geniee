import React, { Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { Button } from '@/Client/helpers/react-bootstrap-imports';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from '../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../containers/PerformanceOverviewContainer';
import VideoAdRevenueContainer from '../containers/VideoAdRevenueContainer';
import PerformanceApOriginalContainer from '../containers/PerformanceApOriginalContainer';
import RevenueContainer from '../containers/RevenueContainer';
import Loader from '../../../Components/Loader/index';
import { dates } from '../configs/commonConsts';
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
			loadCounter: 0
		};
	}

	componentDidMount() {
		const {
			showNotification,
			user: {
				data: { isPaymentDetailsComplete, email }
			},
			sites,
			reportsMeta,
			updateAccountReportMetaData
		} = this.props;
		let userSites = Object.keys(sites).toString();

		userSites = getDashboardDemoUserSiteIds(userSites, email);

		// show payment profile incomplete notification
		if (!isPaymentDetailsComplete && !window.location.pathname.includes('payment')) {
			showNotification({
				mode: 'error',
				title: 'Payments Error',
				message: `Please complete your Payment Profile, for timely payments.
					<a href='/payment'>Go to payments</a>`,
				autoDismiss: 0
			});
		}

		if (!reportsMeta.fetched) {
			return reportService.getMetaData({ sites: userSites }).then(response => {
				console.log(response, 'response');
				let { data: computedData } = response;
				// TBD: Remove this hard coded sample code
				response.data.widget.video_revenue = {
					display_name: 'Video Revenue',
					filter: ['siteid'],
					name: 'video_revenue',
					// path: '/site/report?report_name=primis_video_revenue',
					path: '/site/report?report_name=site_summary',
					position: 3
				};
				response.data.metrics.primis_revenue = {
					chart_position: 10,
					display_name: 'Primis Video Revenue',
					selectable: true,
					table_position: 9,
					valueType: 'money'
				};

				computedData = getDemoUserSites(computedData, email);

				updateAccountReportMetaData(computedData);
				return this.getContentInfo(computedData);
			});
		}

		return this.getContentInfo(reportsMeta.data);
	}

	getContentInfo = reportsMetaData => {
		const { reportType, siteId, widgetsList, sites } = this.props;
		const { site: reportingSites, widget } = reportsMetaData;
		const allUserSites = [{ name: 'All', value: 'all' }, ...convertObjToArr(sites)];
		const topPerformingSite = reportingSites
			? this.getTopPerformingSites(allUserSites, reportingSites)
			: null;
		const selectedSite = reportType == 'site' ? siteId : topPerformingSite || 'all';
		const widgetsConfig = this.getWidgetConfig(widget, selectedSite, reportType, widgetsList);
		console.log(widgetsConfig, 'widgetsConfig');
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

		allUserSites.forEach(site => {
			const siteId = site.value;

			if (reportingSites[siteId] && reportingSites[siteId].isTopPerforming) {
				topPerformingSite = siteId;
				return topPerformingSite;
			}
		});

		return topPerformingSite;
	};

	getWidgetConfig = (widgets, selectedSite, reportType, widgetsList) => {
		const sortedWidgets = sortBy(widgets, ['position', 'name']);
		const widgetsConfig = [];

		Object.keys(sortedWidgets).forEach(wid => {
			const widget = { ...sortedWidgets[wid] };

			if (widgetsList.indexOf(widget.name) > -1) {
				widget.isLoading = true;
				widget.selectedDate = dates[2].value;
				widget.isDataSufficient = false;

				if (reportType === 'site' || widget.name === 'per_ap_original')
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

				if (widget.name === 'per_site_wise' || widget.name === 'video_revenue') {
					widget.selectedDimension = 'siteid';
				}

				if (widget.name === 'ops_country_report') {
					widget.selectedDimension = 'ops_country_report';
					widget.chartLegend = 'Country';
					widget.chartSeriesLabel = 'country';
					widget.chartSeriesMetric = 'adpushup_page_views';
					widget.chartSeriesMetricType = 'number';
				}

				widgetsConfig.push(widget);
			}
		});
		return widgetsConfig;
	};

	getWidgetComponent = widget => {
		const { reportType } = this.props;
		const { isUniqueImpEnabled } = this.state;
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
			case 'video_revenue':
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

	getDisplayData = wid => {
		const { widgetsConfig, isUniqueImpEnabled } = this.state;
		const { selectedDate, selectedSite, name, customDateRange, startDate, endDate } = widgetsConfig[
			wid
		];
		let { path } = widgetsConfig[wid];

		const {
			sites,
			reportsMeta,
			user: {
				data: { email }
			}
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
			name == 'per_ap_original' &&
			reportingSites &&
			reportingSites[selectedSite] &&
			reportingSites[selectedSite].dataAvailableOutOfLast30Days < 21;

		params.siteid = selectedSite == 'all' ? siteIds.toString() : selectedSite;
		params.siteid = getDashboardDemoUserSiteIds(params.siteid, email);
		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;

		if (name == 'per_site_wise' && isUniqueImpEnabled) {
			path = path.replace('network_impressions,', '');
			path = path.replace('network_ad_ecpm,', '');
			path += ',unique_impressions,unique_ad_ecpm';
		}

		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		} else if (params.siteid) {
			reportService.getWidgetData({ path, params }).then(response => {
				console.log(response, 'response getWidgetData', path, name, 'path, name');
				// TBD: remove after getting final API
				if (name === 'video_revenue') {
					response.data = {
						result: [
							{
								primis_revenue: 30,
								report_date: '2021-05-13'
							},
							{
								primis_revenue: 15,
								report_date: '2021-05-15'
							},
							{
								primis_revenue: 54,
								report_date: '2021-05-11'
							},
							{
								primis_revenue: 44,
								report_date: '2021-05-16'
							},
							{
								primis_revenue: 87,
								report_date: '2021-05-14'
							},
							{
								primis_revenue: 13,
								report_date: '2021-05-12'
							},
							{
								primis_revenue: 20,
								report_date: '2021-05-17'
							}
						],
						columns: ['primis_revenue', 'report_date']
					};
				}
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
					response.status == 200 &&
					!isEmpty(response.data) &&
					response.data.result &&
					response.data.result.length
				) {
					widgetsConfig[wid].data = response.data;
					widgetsConfig[wid].isDataSufficient = true;
				} else {
					widgetsConfig[wid].data = {};
					widgetsConfig[wid].isDataSufficient = false;
				}
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
			if (reportingSite && reportingSite.product && reportingSite.product.Layout == 1) {
				layoutSites.push(site);
			}
		});
		return layoutSites;
	};

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

	renderControl(wid) {
		const {
			reportType,
			reportsMeta,
			user: {
				data: { email }
			}
		} = this.props;
		const isDemoUser = checkDemoUserEmail(email);
		const { site: reportingSites } = reportsMeta.data;
		const { widgetsConfig, quickDates, sites } = this.state;
		const { selectedDate, selectedSite, name, focusedInput, startDate, endDate } = widgetsConfig[
			wid
		];
		const layoutSites = reportingSites ? this.getLayoutSites(sites, reportingSites) : [];
		const isPerfApOriginalWidget = !!(name === 'per_ap_original');
		const isPerfApOriginalWidgetForDemoUser = !!(isDemoUser && isPerfApOriginalWidget);
		const computedSelectedSite = isPerfApOriginalWidgetForDemoUser ? sites[1].value : selectedSite;
		let sitesToShow = isPerfApOriginalWidget ? layoutSites : sites;

		const handleDatesChange = ({ startDate, endDate }) => {
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
				this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
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
			widgetsConfig[wid].isLoading = true;
			widgetsConfig[wid].customDateRange = false;
			this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
		};

		const handleFocusUpdate = focusedInput => {
			widgetsConfig[wid].focusedInput = focusedInput;
			this.setState({ widgetsConfig });
		};

		sitesToShow = isDemoUser ? sites : sitesToShow;

		return (
			<div className="aligner aligner--hEnd">
				{name !== 'estimated_earnings' ? (
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
				{reportType !== 'site' && name !== 'per_site_wise' ? (
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
		const { reportType, siteId } = this.props;
		let siteSelected = '';

		if (reportType === 'site') siteSelected = `/${siteId}`;
		else if (selectedSite !== 'all') siteSelected = `/${selectedSite}`;

		const computedReportLink = `/reports${siteSelected}?fromDate=${startDate}&toDate=${endDate}&dimension=${selectedDimension}&chartLegendMetric=${selectedChartLegendMetric}`;

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

		widgetsConfig.forEach((widget, index) => {
			// const widget = widgetsConfig[wid];
			const widgetComponent = this.getWidgetComponent(widget);
			if ((widget.name == 'per_ap_original' && hasLayoutSite) || widget.name != 'per_ap_original') {
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
				{
					<Link to={linkUrl} className="u-link-reset u-margin-t4 aligner aligner-item">
						<CustomButton>{buttonText}</CustomButton>
					</Link>
				}
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
			<Fragment>{isValidUserSites ? this.renderContent() : this.renderOnboardingCard()}</Fragment>
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
