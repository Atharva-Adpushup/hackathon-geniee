import React, { Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from '../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../containers/PerformanceApOriginalContainer';
import RevenueContainer from '../containers/RevenueContainer';
import Loader from '../../../Components/Loader/index';
import { dates } from '../configs/commonConsts';
import { getDashboardDemoUserSiteIds, checkDemoUserEmail } from '../../../helpers/commonFunctions';
import SelectBox from '../../../Components/SelectBox/index';
import reportService from '../../../services/reportService';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import OnboardingCard from '../../../Components/OnboardingCard';
import CustomButton from '../../../Components/CustomButton';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			quickDates: dates,
			sites: [],
			widgetsConfig: [],
			isLoading: true
		};
	}

	componentDidMount() {
		const {
			showNotification,
			user: {
				data: { isPaymentDetailsComplete }
			},
			sites,
			reportsMeta,
			fetchReportingMeta
		} = this.props;
		const userSites = Object.keys(sites).toString();

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
				const { data } = response;
				fetchReportingMeta(data);
				return this.getContentInfo(data);
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
				if (reportType == 'site' || widget.name == 'per_ap_original')
					widget.selectedSite = selectedSite;
				else widget.selectedSite = 'all';
				if (widget.name == 'per_ap_original') {
					widget.selectedDimension = 'page_variation_type';
				}
				if (widget.name == 'rev_by_network') {
					widget.selectedDimension = 'network';
				}
				if (widget.name == 'per_site_wise') {
					widget.selectedDimension = 'siteid';
				}
				widgetsConfig.push(widget);
			}
		});
		return widgetsConfig;
	};

	getWidgetComponent = widget => {
		const { reportType } = this.props;
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
				return <PerformanceOverviewContainer displayData={widget.data} />;
			case 'per_site_wise':
				if (reportType != 'site') {
					return <SitewiseReportContainer displayData={widget.data} />;
				}
				return '';
			case 'per_site_wise_daily':
				if (reportType == 'site') {
					return <SitewiseReportContainer displayData={widget.data} reportType="site" />;
				}
				return '';
			case 'rev_by_network':
				return <RevenueContainer displayData={widget.data} />;
			default:
		}
	};

	getDisplayData = wid => {
		const { widgetsConfig } = this.state;
		const { selectedDate, selectedSite, path, name } = widgetsConfig[wid];
		const {
			sites,
			reportsMeta,
			user: {
				data: { email }
			}
		} = this.props;
		const { site: reportingSites } = reportsMeta.data;
		const siteIds = Object.keys(sites);
		const params = getDateRange(selectedDate);
		const hidPerApOriginData =
			name == 'per_ap_original' &&
			reportingSites &&
			reportingSites[selectedSite] &&
			reportingSites[selectedSite].dataAvailableOutOfLast30Days < 21;

		params.siteid = selectedSite == 'all' ? siteIds.toString() : selectedSite;
		params.siteid = getDashboardDemoUserSiteIds(params.siteid, email);
		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;

		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		} else if (params.siteid)
			reportService.getWidgetData({ path, params }).then(response => {
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
		else {
			widgetsConfig[wid].data = {};
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		}
	};

	getLayoutSites = (allUserSites, reportingSites) => {
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
		const { selectedDate, selectedSite, name } = widgetsConfig[wid];
		const layoutSites = reportingSites ? this.getLayoutSites(sites, reportingSites) : [];
		let sitesToShow = name == 'per_ap_original' ? layoutSites : sites;

		sitesToShow = isDemoUser ? sites : sitesToShow;

		return (
			<div className="aligner aligner--hEnd">
				{name !== 'estimated_earnings' ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Quick Dates</label>
						<SelectBox
							id="performance-date"
							wrapperClassName="display-inline"
							pullRight
							isClearable={false}
							isSearchable={false}
							selected={selectedDate}
							options={quickDates}
							onSelect={date => {
								widgetsConfig[wid]['selectedDate'] = date;
								widgetsConfig[wid].isLoading = true;
								this.setState({ widgetsConfig }, () => this.getDisplayData(wid));
							}}
						/>

						{/* eslint-enable */}
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
		const { startDate, endDate, selectedSite, selectedDimension, isDataSufficient } = widgetsConfig[
			wid
		];
		const { reportType, siteId } = this.props;
		let siteSelected;
		if (reportType === 'site') siteSelected = siteId;
		else if (selectedSite != 'all') siteSelected = selectedSite;
		return (
			<Link
				to={
					siteSelected
						? `/reports/${siteSelected}?fromDate=${startDate}&toDate=${endDate}&dimension=${selectedDimension}`
						: `/reports?fromDate=${startDate}&toDate=${endDate}&dimension=${selectedDimension}`
				}
				className="u-link-reset aligner aligner-item float-right"
			>
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
			//const widget = widgetsConfig[wid];
			const widgetComponent = this.getWidgetComponent(widget);
			if ((widget.name == 'per_ap_original' && hasLayoutSite) || widget.name != 'per_ap_original')
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
		});

		return content;
	};

	renderOnboardingCard() {
		const { user, reportType, siteId } = this.props;
		const userSites = user.data && user.data.sites ? user.data.sites : {};
		let site;
		if (reportType == 'site') site = userSites[Object.keys(userSites)[siteId]];
		else site = userSites[Object.keys(userSites)[0]];
		const computedLinkUrl = `/onboarding?siteId=${site.siteId}`;
		const computedButtonText = `Continue with ${site.domain}`;

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
				<Link to={computedLinkUrl} className="u-link-reset u-margin-t4 aligner aligner-item">
					<CustomButton>{computedButtonText}</CustomButton>
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
			<Fragment>{isValidUserSites ? this.renderContent() : this.renderOnboardingCard()}</Fragment>
		);
	}
}

export default Dashboard;
