import React, { Fragment } from 'react';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/cloneDeep';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../../../scss/pages/dashboard/index.scss';
import Card from '../../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../../../../Pages/Dashboard/containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../../../../Pages/Dashboard/containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../../../../Pages/Dashboard/containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../../../../Pages/Dashboard/containers/PerformanceApOriginalContainer';
import RevenueContainer from '../../../../Pages/Dashboard/containers/RevenueContainer';
import Loader from '../../../../Components/Loader/index';
import { dates } from '../../../../Pages/Dashboard/configs/commonConsts';
import SelectBox from '../../../../Components/SelectBox/index';
import reportService from '../../../../services/reportService';
import { convertObjToArr, getDateRange } from '../../../../Pages/Dashboard/helpers/utils';

class QuickSnapshot extends React.Component {
	constructor(props) {
		super(props);
		const { reportType, sites, reportingSites } = props;
		const allUserSites = [{ name: 'All', value: 'all' }, ...convertObjToArr(sites)];
		// const topPerformingSite = reportingSites
		// 	? this.getTopPerformingSites(allUserSites, reportingSites)
		// 	: null;
		// const selectedSite = reportType == 'site' ? siteId : topPerformingSite || 'all';
		this.state = {
			quickDates: dates,
			sites: allUserSites,
			reportType,
			widgetsConfig: [],
			isLoading: true
		};
	}

	componentDidMount() {
		const { sites, isReportsMetaFetched, setReportingMetaData } = this.props;
		const userSites = Object.keys(sites).toString();

		if (!isReportsMetaFetched) {
			return reportService.getMetaData({ sites: userSites }).then(response => {
				const { data } = response;

				setReportingMetaData(data);
				this.renderComputedWidgetsUI();
			});
		}

		return this.renderComputedWidgetsUI();
	}

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

	getWidgetConfig = (widgets, widgetsList) => {
		const {
			widgetsName: { PER_AP_ORIGINAL, OPS_TOP_SITES, OPS_COUNTRY_REPORT, OPS_NETWORK_REPORT }
		} = this.props;
		const sortedWidgets = sortBy(widgets, ['position', 'name']);
		const widgetsConfig = [];

		Object.keys(sortedWidgets).forEach(wid => {
			const widget = { ...sortedWidgets[wid] };

			if (widgetsList.indexOf(widget.name) > -1) {
				widget.isLoading = true;
				widget.selectedDate = dates[2].value;
				widget.isDataSufficient = false;
				widget.selectedSite = 'all';

				switch (widget.name) {
					case PER_AP_ORIGINAL:
						widget.selectedDimension = 'page_variation_type';
						widget.selectedChartLegendMetric = 'adpushup_page_cpm';
						break;

					case OPS_TOP_SITES:
						widget.selectedDimension = 'siteid';
						break;

					case OPS_COUNTRY_REPORT:
						widget.selectedDimension = 'country';
						widget.chartLegend = 'Country';
						widget.chartSeriesLabel = 'country';
						widget.chartSeriesMetric = 'adpushup_page_views';
						widget.chartSeriesMetricType = 'number';
						widget.path += `&metrics=adpushup_page_views`;
						break;

					case OPS_NETWORK_REPORT:
						widget.selectedDimension = 'network';
						widget.chartLegend = 'Network';
						widget.chartSeriesLabel = 'network';
						widget.chartSeriesMetric = 'network_net_revenue';
						widget.chartSeriesMetricType = 'money';
						widget.path += `&metrics=network_net_revenue`;
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
			reportType,
			widgetsName: {
				ESTIMATED_EARNINGS,
				PER_AP_ORIGINAL,
				PER_OVERVIEW,
				OPS_TOP_SITES,
				OPS_COUNTRY_REPORT,
				OPS_NETWORK_REPORT,
				OPS_ERROR_REPORT
			}
		} = this.props;
		let computedWidgetData;

		if (widget.isLoading) return <Loader height="20vh" />;

		switch (widget.name) {
			case ESTIMATED_EARNINGS:
				return <EstimatedEarningsContainer displayData={widget.data} />;

			case PER_AP_ORIGINAL:
				return (
					<PerformanceApOriginalContainer
						displayData={widget.data}
						isDataSufficient={widget.isDataSufficient}
					/>
				);

			case PER_OVERVIEW:
				return <PerformanceOverviewContainer displayData={widget.data} />;

			case OPS_TOP_SITES:
				computedWidgetData = this.getTopSitesWidgetTransformedData(widget.data);
				return <SitewiseReportContainer disableSiteLevelCheck displayData={computedWidgetData} />;

			case 'ops_top_sites_daily':
				if (reportType == 'site') {
					return <SitewiseReportContainer displayData={widget.data} reportType="site" />;
				}
				return '';

			case OPS_COUNTRY_REPORT:
			case OPS_NETWORK_REPORT:
			case OPS_ERROR_REPORT:
				return <RevenueContainer displayData={widget} />;
			default:
		}

		return false;
	};

	getDisplayData = wid => {
		const { widgetsConfig, reportType } = this.state;
		const isReportTypeAccount = !!(reportType === 'account');
		const isReportTypeGlobal = !!(reportType === 'global');
		const { selectedDate, selectedSite, path, name } = widgetsConfig[wid];
		const { sites, reportingSites } = this.props;
		const siteIds = Object.keys(sites);
		const params = getDateRange(selectedDate);
		const hidPerApOriginData =
			isReportTypeAccount &&
			name === 'per_ap_original' &&
			reportingSites &&
			reportingSites[selectedSite] &&
			reportingSites[selectedSite].dataAvailableOutOfLast30Days < 21;

		params.siteid = selectedSite === 'all' ? siteIds.toString() : selectedSite;

		if (isReportTypeGlobal) {
			delete params.siteid;
			params.isSuperUser = true;
		}

		// params.fromDate = '2019-08-05';
		// params.toDate = '2019-08-06';

		widgetsConfig[wid].startDate = params.fromDate;
		widgetsConfig[wid].endDate = params.toDate;
		const validReportParams = !!(params.siteid || params.isSuperUser);

		if (hidPerApOriginData) {
			widgetsConfig[wid].isDataSufficient = false;
			widgetsConfig[wid].isLoading = false;
		} else if (validReportParams) {
			reportService.getWidgetData({ path, params }).then(response => {
				if (
					response.status == 200 &&
					!isEmpty(response.data) &&
					response.data.result &&
					response.data.result.length > 0
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
		}

		this.setState({ widgetsConfig });
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

	getTopSitesWidgetTransformedData = displayData => {
		const computedData = cloneDeep(displayData);

		computedData.result = orderBy(computedData.result, ['network_net_revenue'], ['desc']).slice(
			0,
			10
		);
		return computedData;
	};

	showApBaselineWidget = () => {
		const { siteId, reportingSites } = this.props;
		const { reportType } = this.state;
		const { sites } = this.state;
		const isReportTypeGlobal = !!(reportType === 'global');
		const isReportTypeSite = !!(reportType === 'site');
		const isReportTypeAccount = !!(reportType === 'account');
		const hasUserSiteProductLayout = !!(
			isReportTypeSite &&
			reportingSites &&
			reportingSites[siteId] &&
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

	renderWidgetsUI = inputWidgetsConfig => {
		const { widgetsConfig } = this.state;
		const computedWidgetsConfig = inputWidgetsConfig || widgetsConfig;

		Object.keys(computedWidgetsConfig).forEach(wid => {
			this.getDisplayData(wid);
		});
	};

	renderComputedWidgetsUI = () => {
		const { widget, widgetsList } = this.props;
		const widgetsConfig = this.getWidgetConfig(widget, widgetsList);

		this.setState({ widgetsConfig, isLoading: false }, () => this.renderWidgetsUI(widgetsConfig));
	};

	renderControl(wid) {
		const { reportingSites } = this.props;
		const { widgetsConfig, quickDates, sites, reportType } = this.state;
		const { selectedDate, selectedSite, name } = widgetsConfig[wid];
		const layoutSites = reportingSites ? this.getLayoutSites(sites, reportingSites) : [];
		const isWidgetNamePerAPOriginal = !!(name === 'per_ap_original');
		const sitesToShow = isWidgetNamePerAPOriginal ? layoutSites : sites;
		// TODO: Work on show/hide of websites dropdown in every widget once all widgets are implemented successfully
		// const isReportTypeGlobal = !!(reportType === 'global');
		// const isWidgetApOriginalInGlobalReport = !!(isReportTypeGlobal && isWidgetNamePerAPOriginal);
		// const shouldHideControls = isWidgetApOriginalInGlobalReport;
		const shouldHideControls = false;

		return shouldHideControls ? null : (
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
				{reportType !== 'site' && name !== 'ops_top_sites' ? (
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
			selectedDimension,
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

	renderHeader = () => {
		const ref = this;
		const { reportType } = ref.state;
		const options = [{ name: 'Account', value: 'account' }, { name: 'Global', value: 'global' }];

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
							ref.setState({ reportType: item }, () => ref.renderComputedWidgetsUI())
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

		return content;
	};

	render() {
		const { isLoading } = this.state;

		if (isLoading) {
			return <Loader />;
		}

		return <Fragment>{this.renderContent()}</Fragment>;
	}
}

export default QuickSnapshot;
