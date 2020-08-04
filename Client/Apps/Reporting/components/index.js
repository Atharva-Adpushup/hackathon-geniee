import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
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
import '../../../scss/apps/reporting/index.scss';

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
				redirectUrl = `${computedRedirectUrl}/general`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/url-analytics`;
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case REPORTS_NAV_ITEMS_INDEXES.GENERAL:
				return <ReportContainer isCustomizeChartLegend {...this.props} />;
			case REPORTS_NAV_ITEMS_INDEXES.URL_UTM_REPORTING:
				return <URLAndUTMContainer isCustomizeChartLegend {...this.props} />;
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();

		const activeItem = REPORTS_NAV_ITEMS[activeTab];
		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		const { userSites } = this.props;
		let isURLReportingEnabled = false;
		const sites = Object.values(userSites);
		// eslint-disable-next-line array-callback-return
		sites.map(site => {
			isURLReportingEnabled = !!site.urlReporting;
		});

		return (
			<ActionCard>
				{
					<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
						<NavItem eventKey={1}>{REPORTS_NAV_ITEMS_VALUES.GENERAL}</NavItem>
						{isURLReportingEnabled && (
							<NavItem eventKey={2}>{REPORTS_NAV_ITEMS_VALUES.URL_UTM_REPORTING}</NavItem>
						)}
					</Nav>
				}
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default ReportsPanel;
