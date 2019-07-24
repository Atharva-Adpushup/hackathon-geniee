import React, { Fragment } from 'react';
import { sortBy } from 'lodash';
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
import SelectBox from '../../../Components/SelectBox/index';
import reportService from '../../../services/reportService';
import { convertObjToArr, getDateRange } from '../helpers/utils';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		const { site, widget, reportType, siteId, widgetsList } = props;
		const sites = [{ name: 'All', value: 'all' }, ...convertObjToArr(site)];
		const topPerformingSite = sites.find(site => site.isTopPerforming);
		const selectedSite =
			reportType == 'site' ? siteId : topPerformingSite ? topPerformingSite.value : 'all';
		const widgetsConfig = this.getWidgetConfig(widget, selectedSite, reportType, widgetsList);
		this.state = {
			quickDates: dates,
			sites,
			widgetsConfig
		};
	}

	componentDidMount() {
		const { showNotification, user } = this.props;
		const { widgetsConfig } = this.state;
		if (!user.data.isPaymentDetailsComplete && !window.location.pathname.includes('payment')) {
			showNotification({
				mode: 'error',
				title: 'Payments Error',
				message: `Please complete your Payment Profile, for timely payments.
					<a href='/payment'>Go to payments</a>`,
				autoDismiss: 0
			});
		}
		for (const wid in widgetsConfig) {
			this.getDisplayData(wid);
		}
	}

	getWidgetConfig = (widgets, selectedSite, reportType, widgetsList) => {
		const sortedWidgets = sortBy(widgets, ['position', 'name']);
		const widgetsConfig = [];
		for (const wid in sortedWidgets) {
			const widget = { ...sortedWidgets[wid] };
			if (widgetsList.indexOf(widget.name) > -1) {
				widget.isLoading = true;
				widget.selectedDate = dates[0].value;
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
		}
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
				return;
			case 'per_site_wise_daily':
				if (reportType == 'site') {
					return <SitewiseReportContainer displayData={widget.data} reportType="site" />;
				}
				return;
			case 'rev_by_network':
				return <RevenueContainer displayData={widget.data} />;
		}
	};

	renderControl(wid) {
		const { reportType } = this.props;
		const { widgetsConfig, quickDates, sites } = this.state;
		const { selectedDate, selectedSite, name } = widgetsConfig[wid];
		const sitesToShow =
			name == 'per_ap_original'
				? sites.filter(site => site.product && site.product.Layout == 1)
				: sites;
		return (
			<div className="aligner aligner--hEnd">
				{name !== 'estimated_earnings' ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Quick Dates</label>
						<SelectBox
							id="performance-date"
							wrapperClassName="display-inline"
							isClearable={false}
							isSearchable={false}
							selected={selectedDate}
							options={quickDates}
							onSelect={date => {
								widgetsConfig[wid]['selectedDate'] = date;
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
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedSite}
							options={sitesToShow}
							onSelect={site => {
								widgetsConfig[wid]['selectedSite'] = site;
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
		const { startDate, endDate, selectedSite, selectedDimension } = widgetsConfig[wid];
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
				<Button className="aligner-item aligner aligner--vCenter">
					View Reports
					<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
				</Button>
			</Link>
		);
	}

	getDisplayData = wid => {
		const { widgetsConfig } = this.state;
		const { selectedDate, selectedSite, path, name } = widgetsConfig[wid];
		const { site } = this.props;
		const siteIds = Object.keys(site);
		const params = getDateRange(selectedDate);
		const hidPerApOriginData =
			name == 'per_ap_original' &&
			selectedSite != 'all' &&
			site[selectedSite] &&
			site[selectedSite].dataAvailableOutOfLast30Days < 21;
		params.siteid = selectedSite == 'all' ? siteIds.toString() : selectedSite;
		widgetsConfig[wid].isLoading = true;
		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;
		this.setState({ widgetsConfig });
		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
			this.setState({ widgetsConfig });
		} else
			reportService.getWidgetData({ path, params }).then(response => {
				if (response.status == 200 && response.data && response.data) {
					widgetsConfig[wid].data = response.data;
				}
				widgetsConfig[wid].isDataSufficient = true;
				widgetsConfig[wid].isLoading = false;
				this.setState({ widgetsConfig });
			});
	};

	renderContent = () => {
		const { widgetsConfig } = this.state;
		const { site, reportType, siteId } = this.props;
		const content = [];
		for (const wid in widgetsConfig) {
			const widget = widgetsConfig[wid];
			const widgetComponent = this.getWidgetComponent(widget);
			if (
				widget.name != 'per_ap_original' ||
				reportType != 'site' ||
				!site[siteId] ||
				site[siteId].product.Layout == 1
			)
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
							widget.name !== 'estimated_earnings' ? this.renderViewReportButton(wid) : null
						}
					/>
				);
		}

		return content;
	};

	render() {
		return <Fragment>{this.renderContent()}</Fragment>;
	}
}

export default Dashboard;
