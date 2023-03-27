import React, { Component } from 'react';
import { Tab, Nav, NavItem, Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import { TOOLS_IDENTIFIERS } from '../../configs/commonConsts';
import RegexVerification from './RegexVerification/index';
import BackupAds from './BackupAds/index';
import TopXPathMissAndModeURL from './TopXPathMissAndModeURL ';
import LostFoundLiveSites from './LostFoundLiveSites/index';
import AdsTxtLiveSitesEntries from './AdsTxtLiveSitesEntries';
import BidderSettings from './BidderSettings';
import DashboardNotifications from './DashboardNotifications';
import authService from '../../../../services/authService';
import BidderRules from './NetworkWideHBRules';
import InventoryTabContainer from '../../containers/InventoryTabContainer';
import MgDeals from './MgDeals';

class Tools extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: TOOLS_IDENTIFIERS.BACKUP_ADS,
			dashboardNotificationAccess: false,
			mgDealsDashboardAccess: false // Access controlled
		};
	}

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	toggleDashboardNotificationAccess = status => {
		this.setState({ dashboardNotificationAccess: status });
	};

	checkStatus = () => {
		const { user } = this.props;
		const { email, originalEmail } = authService.getTokenPayloadWithoutVerification();
		if (
			(!originalEmail && user.dashboardNotificationAccess) ||
			(originalEmail === email && user.dashboardNotificationAccess)
		) {
			this.toggleDashboardNotificationAccess(true);
		}
	};

	checkMgDealsDashboardAccess = () => {
		const { user } = this.props;
		const { email, originalEmail } = authService.getTokenPayloadWithoutVerification();
		if (
			(!originalEmail && user.mgDealsDashboardAccess) ||
			(originalEmail === email && user.mgDealsDashboardAccess)
		) {
			this.setState({ mgDealsDashboardAccess: true });
		}
	};

	componentDidMount = () => {
		this.checkStatus();
		this.checkMgDealsDashboardAccess();
	};

	renderContent = () => {
		const { activeKey } = this.state;
		const {
			networkConfig,
			sites,
			showNotification,
			updateNetworkConfig,
			saveNetworkWideRules,
			setUnsavedChangesAction,
			customProps,
			user,
			rules,
			emailSitesMapping
		} = this.props;

		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: '',
			actionInfo: 'Bidders Configuration Update'
		};

		switch (activeKey) {
			default:
			case TOOLS_IDENTIFIERS.BACKUP_ADS:
				return (
					<BackupAds
						showNotification={showNotification}
						sites={sites}
						dataForAuditLogs={dataForAuditLogs}
					/>
				);
			case TOOLS_IDENTIFIERS.REGEX_VERIFICATION:
				return <RegexVerification sites={sites} showNotification={showNotification} />;
			case TOOLS_IDENTIFIERS.TOP_XPATH_MISS_MODE_URL:
				return <TopXPathMissAndModeURL showNotification={showNotification} />;

			case TOOLS_IDENTIFIERS.LOST_FOUND_LIVE_SITES:
				return <LostFoundLiveSites showNotification={showNotification} />;

			case TOOLS_IDENTIFIERS.ADS_TXT_LIVE_SITES:
				return <AdsTxtLiveSitesEntries showNotification={showNotification} />;

			case TOOLS_IDENTIFIERS.BIDDER_RULES:
				return (
					<BidderRules
						bidders={networkConfig}
						showNotification={showNotification}
						saveNetworkWideRules={saveNetworkWideRules}
						setUnsavedChangesAction={setUnsavedChangesAction}
						rules={rules}
						customProps={customProps}
					/>
				);

			case TOOLS_IDENTIFIERS.REGEX_GENERATION:
				return 'Regex Generation';
			case TOOLS_IDENTIFIERS.BIDDER_CONFIGURATIONS:
				return (
					<BidderSettings
						dataForAuditLogs={dataForAuditLogs}
						networks={networkConfig}
						updateNetworkConfig={updateNetworkConfig}
						showNotification={showNotification}
						user={user}
					/>
				);
			case TOOLS_IDENTIFIERS.DASHBOARD_NOTIFICATIONS:
				return <DashboardNotifications showNotification={showNotification} />;
			case TOOLS_IDENTIFIERS.INVENTORY:
				return (
					<InventoryTabContainer dataForAuditLogs={dataForAuditLogs} customProps={customProps} />
				);
			case TOOLS_IDENTIFIERS.MG_DEAL:
				return <MgDeals emailSitesMapping={emailSitesMapping} />;
		}
	};

	render() {
		const { activeKey, dashboardNotificationAccess, mgDealsDashboardAccess } = this.state;

		return (
			<div className="u-padding-v4">
				<Tab.Container
					id="ops-panel-settings-container"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Row className="clearfix">
						<Col sm={2}>
							<Nav bsStyle="pills" bsClass="ap-nav-pills nav" stacked>
								<NavItem eventKey={TOOLS_IDENTIFIERS.BACKUP_ADS}>Backup Ads</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.BIDDER_CONFIGURATIONS}>
									Bidders Configurations
								</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.REGEX_VERIFICATION}>
									Regex Verification
								</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.TOP_XPATH_MISS_MODE_URL}>
									Top Xpath Miss and Mode URLs
								</NavItem>

								<NavItem eventKey={TOOLS_IDENTIFIERS.LOST_FOUND_LIVE_SITES}>
									Lost And Found Live Sites Chart
								</NavItem>

								<NavItem eventKey={TOOLS_IDENTIFIERS.ADS_TXT_LIVE_SITES}>
									Ads.txt Entries Live Sites
								</NavItem>

								<NavItem eventKey={TOOLS_IDENTIFIERS.BIDDER_RULES}>Bidder Rules</NavItem>

								<NavItem eventKey={TOOLS_IDENTIFIERS.INVENTORY}>Ad Unit Inventory Tab</NavItem>
								{dashboardNotificationAccess ? (
									<NavItem eventKey={TOOLS_IDENTIFIERS.DASHBOARD_NOTIFICATIONS}>
										Dashboard Notifications
									</NavItem>
								) : (
									<></>
								)}
								{mgDealsDashboardAccess ? (
									<NavItem eventKey={TOOLS_IDENTIFIERS.MG_DEAL}>Mg Deal</NavItem>
								) : (
									<></>
								)}
								{/* <NavItem eventKey={TOOLS_IDENTIFIERS.REGEX_GENERATION}>Regex Generation</NavItem> */}
							</Nav>
						</Col>
						<Col sm={10}>
							<Tab.Content animation>{this.renderContent()}</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</div>
		);
	}
}

export default Tools;
