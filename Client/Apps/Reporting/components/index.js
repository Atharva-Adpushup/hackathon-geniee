import React, { Component } from 'react';
import { Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';

import {
	REPORTS_NAV_ITEMS,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES
} from '../configs/commonConsts';
import ActionCard from '../../../Components/ActionCard';
// import Settings from './Settings/index';
import ReportContainer from '../containers/ReportContainer';
import URLAndUTMContainer from '../containers/URLAndUTMContainer';
import HBAnalyticContainer from '../containers/HBAnalyticContainer';
import DelayFlag from './Flag';
import '../../../scss/apps/reporting/index.scss';
import history from '../../../helpers/history';

class ReportsPanel extends Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	handleNavSelect = value => {
		const computedRedirectUrl = `/reports`;
		let redirectUrl = '';
		switch (Number(value)) {
			default:
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/url-utm-analytics`;
				break;

			case 3:
				redirectUrl = `${computedRedirectUrl}/hb-analytics`;
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case REPORTS_NAV_ITEMS_INDEXES.REPORT:
				return <ReportContainer isCustomizeChartLegend {...this.props} />;
			case REPORTS_NAV_ITEMS_INDEXES.URL_UTM_REPORTING:
				return <URLAndUTMContainer isCustomizeChartLegend {...this.props} />;
			case REPORTS_NAV_ITEMS_INDEXES.HB_ANALYTICS:
				return <HBAnalyticContainer isCustomizeChartLegend {...this.props} />;
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();

		const activeItem = REPORTS_NAV_ITEMS[activeTab];
		if (redirectUrl) {
			history.push(redirectUrl);
			return null;
		}

		const { userSites, match, userSitesInfo, reportingDelayPopup } = this.props;
		let isURLReportingEnabled = false;
		let isHBAnalyticsEnabled = false;

		const sites = Object.values(userSites);
		sites.map(site => {
			isURLReportingEnabled = isURLReportingEnabled || !!site.urlReporting;
			const { product = {} } = userSitesInfo[site.siteId];
			isHBAnalyticsEnabled = isHBAnalyticsEnabled || !!product.hbAnalytics;
			return site;
		});

		if (
			match &&
			(match.url === '/reports/url-utm-analytics' || match.url === '/reports/hb-analytics') &&
			match.path === '/reports/:siteId'
		) {
			return '';
		}

		return (
			<>
				{reportingDelayPopup && <DelayFlag />}
				<ActionCard>
					{
						<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
							<NavItem eventKey={1}>
								{isURLReportingEnabled ? 'General' : REPORTS_NAV_ITEMS_VALUES.REPORT}
							</NavItem>
							{isURLReportingEnabled && (
								<NavItem eventKey={2}>{REPORTS_NAV_ITEMS_VALUES.URL_UTM_REPORTING}</NavItem>
							)}
							{isHBAnalyticsEnabled && (
								<NavItem eventKey={3}>{REPORTS_NAV_ITEMS_VALUES.HB_ANALYTICS}</NavItem>
							)}
						</Nav>
					}
					{this.renderContent()}
				</ActionCard>
			</>
		);
	}
}

export default ReportsPanel;
