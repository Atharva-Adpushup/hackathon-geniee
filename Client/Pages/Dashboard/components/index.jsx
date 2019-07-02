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
import Selectbox from '../../../Components/Selectbox/index';
import reportService from '../../../services/reportService';
import { convertObjToArr, getDateRange } from '../helpers/utils';

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		const { site } = this.props;
		const sites = [{ name: 'All', value: 'all' }, ...convertObjToArr(site)];
		const topPerformingSite = sites.find(site => site['isTopPerforming']);
		const selectedSite = topPerformingSite ? topPerformingSite['value'] : 'all';
		const widgets = sortBy(this.props.widget, wid => wid.position);
		for (let wid in widgets) {
			widgets[wid]['isLoading'] = true;
			widgets[wid]['selectedDate'] = dates[0].value;
			if (widgets[wid]['name'] == 'per_ap_original') {
				widgets[wid]['selectedSite'] = selectedSite;
				widgets[wid]['selectedDimension'] = 'page_variation_type';
			} else widgets[wid]['selectedSite'] = 'all';
			if (widgets[wid]['name'] == 'rev_by_network') {
				widgets[wid]['selectedDimension'] = 'network';
			}
			if (widgets[wid]['name'] == 'per_site_wise') {
				widgets[wid]['selectedDimension'] = 'siteid';
			}
		}
		this.state = {
			quickDates: dates,
			sites,
			widgetsConfig: widgets
		};
	}
	componentDidMount() {
		const { showNotification, user } = this.props;
		let { widgetsConfig } = this.state;
		if (!user.isPaymentDetailsComplete && !window.location.pathname.includes('payment')) {
			showNotification({
				mode: 'error',
				title: 'Payments Error',
				message: `Please complete your Payment Profile, for timely payments.
					<a href='/payment'>Go to payments</a>`,
				autoDismiss: 0
			});
		}
		for (let wid in widgetsConfig) {
			this.getDisplayData(wid);
		}
	}

	getWidgetComponent = widget => {
		switch (widget.name) {
			case 'estimated_earnings':
				if (widget.isLoading) return this.renderLoader();
				else return <EstimatedEarningsContainer displayData={widget.data} />;
			case 'per_ap_original':
				if (widget.isLoading) return this.renderLoader();
				else
					return (
						<PerformanceApOriginalContainer
							displayData={widget.data}
							isDataSufficient={widget.isDataSufficient}
						/>
					);
			case 'per_overview':
				if (widget.isLoading) return this.renderLoader();
				else return <PerformanceOverviewContainer displayData={widget.data} />;
			case 'per_site_wise':
				if (widget.isLoading) return this.renderLoader();
				else return <SitewiseReportContainer displayData={widget.data} />;
			case 'rev_by_network':
				if (widget.isLoading) return this.renderLoader();
				else return <RevenueContainer displayData={widget.data} />;
		}
	};
	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%' }}>
			<Loader height="20vh" />
		</div>
	);

	renderControl(wid) {
		const { reportType } = this.props;
		const { widgetsConfig, quickDates, sites } = this.state;
		const { selectedDate, selectedSite, name } = widgetsConfig[wid];
		let layoutSites;
		if (name == 'per_ap_original') {
			layoutSites = sites.filter(site => site['product'] && site['product']['Layout'] == 1);
		}
		return (
			<div className="aligner aligner--hEnd">
				{name !== 'estimated_earnings' ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Quick Dates</label>
						<Selectbox
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
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Website</label>
						<Selectbox
							id="performance-site"
							isClearable={false}
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedSite}
							options={name == 'per_ap_original' ? layoutSites : sites}
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
		const params = getDateRange(selectedDate);
		const { reportType, siteId, site } = this.props;
		if (reportType === 'site') params['siteid'] = siteId;
		else if (selectedSite != 'all') params['siteid'] = selectedSite;
		else {
			const siteIds = Object.keys(site);
			params['siteid'] = siteIds.toString();
		}
		widgetsConfig[wid]['isLoading'] = true;
		widgetsConfig[wid]['startDate'] = params['fromDate'];
		widgetsConfig[wid]['endDate'] = params['toDate'];
		this.setState({ widgetsConfig });
		if (
			name == 'per_ap_original' &&
			selectedSite != 'all' &&
			site[selectedSite]['dataAvailableOutOfLast30Days'] < 21
		) {
			widgetsConfig[wid]['isDataSufficient'] = false;
			widgetsConfig[wid]['isLoading'] = false;
			this.setState({ widgetsConfig });
		} else
			reportService.getWidgetData({ path, params }).then(response => {
				if (response.status == 200 && response.data && response.data) {
					widgetsConfig[wid]['data'] = response.data;
				}
				widgetsConfig[wid]['isDataSufficient'] = true;
				widgetsConfig[wid]['isLoading'] = false;
				this.setState({ widgetsConfig });
			});
	};

	renderContent = () => {
		let { widgetsConfig } = this.state;
		const { site, reportType, siteId } = this.props;
		const content = [];
		for (let wid in widgetsConfig) {
			const widget = widgetsConfig[wid];
			const widgetComponent = this.getWidgetComponent(widget);
			if (
				widget.name != 'per_ap_original' ||
				reportType != 'site' ||
				!site[siteId] ||
				site[siteId]['product']['Layout'] == 1
			)
				content.push(
					<Card
						rootClassName={
							widget.name === 'estimated_earnings'
								? 'u-margin-b4 width-100 card-color'
								: 'u-margin-b4 width-100'
						}
						key={widget.name}
						type={widget.name !== 'estimated_earnings' ? 'danger' : 'default'}
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">{widget.display_name}</span>
								{this.renderControl(wid)}
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={widgetComponent}
						footerChildren={
							widget.name !== 'estimated_earnings' ? this.renderViewReportButton(wid) : ''
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
