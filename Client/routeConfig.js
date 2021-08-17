import { lazy } from 'react';
import { NAV_ITEMS_INDEXES } from './Pages/ManageSite/constants/index';
import { IA_NAV_ITEMS_INDEXES } from './Apps/InnovativeAds/configs/commonConsts';
import { APT_NAV_ITEMS_INDEXES } from './Apps/ApTag/configs/commonConsts';
import { AMP_NAV_ITEMS_INDEXES } from './Apps/AmpTag/configs/commonConsts';
import { REPORTS_NAV_ITEMS_INDEXES } from './Apps/Reporting/configs/commonConsts';
import { PAYMENT_NAV_ITEMS_INDEXES } from './Pages/Payment/configs/commonConsts';
import { ADSTXT_NAV_ITEMS_INDEXES } from './Pages/AdsTxtManagement/configs/commonConsts';
import { OP_NAV_ITEMS_INDEXES } from './Apps/OpsPanel/configs/commonConsts';
import { NAV_ITEMS_INDEXES as HB_NAV_ITEMS_INDEXES } from './Apps/HeaderBidding/constants';
import { ROUTE_APP_NAME } from './constants/global';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import NotificationHistory from './Containers/NotificationHistoryContainer';

const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './Pages/Sites'));
const Integrations = lazy(() =>
	import(/* webpackChunkName: "integrations" */ './Pages/Integrations/index')
);
const AdsTxtManagement = lazy(() =>
	import(/* webpackChunkName: "adsTxtManagement" */ './Pages/AdsTxtManagement')
);
const Payment = lazy(() => import(/* webpackChunkName: "payment" */ './Pages/Payment'));
const ApTag = lazy(() => import(/* webpackChunkName: "apTag" */ './Apps/ApTag/index'));
const Amp = lazy(() => import(/* webpackChunkName: "ampTag" */ './Apps/AmpTag/index'));
const InnovativeAds = lazy(() =>
	import(/* webpackChunkName: "innovativeAds" */ './Apps/InnovativeAds/index')
);
const Reporting = lazy(() => import(/* webpackChunkName: "reporting" */ './Apps/Reporting/index'));
const ManageSite = lazy(() =>
	import(/* webpackChunkName: "manageSite" */ './Pages/ManageSite/index')
);
const HeaderBidding = lazy(() =>
	import(/* webpackChunkName: "headerBidding" */ './Apps/HeaderBidding')
);

const OnBoarding = lazy(() => import(/* webpackChunkName: "onBoarding" */ './Pages/OnBoarding'));
const AddNewSite = lazy(() => import(/* webpackChunkName: "addNewSite" */ './Pages/AddNewSite'));
const Layout = lazy(() => import(/* webpackChunkName: "layout" */ './Apps/Layout/index'));
const OpsPanel = lazy(() => import(/* webpackChunkName: "opsPanel" */ './Apps/OpsPanel/index'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './Pages/Dashboard'));

const ROUTES = {
	public: [
		{
			name: 'Login',
			exact: true,
			path: '/login',
			component: Login
		},
		{
			name: 'Signup',
			exact: true,
			path: '/signup',
			component: Signup
		},
		{
			name: 'ForgotPassword',
			exact: true,
			path: '/forgot-password',
			component: ForgotPassword
		},
		{
			name: 'ResetPassword',
			exact: true,
			path: '/reset-password',
			component: ResetPassword
		}
	],
	private: [
		{
			path: '/dashboard',
			name: 'Dashboard',
			exact: true,
			component: Dashboard
		},
		{
			path: '/sites',
			name: 'My Sites',
			exact: true,
			component: Sites
		},
		{
			path: '/sites/:siteId',
			name: ':siteId',
			exact: true,
			customProps: { activeTab: NAV_ITEMS_INDEXES.QUICK_SNAPSHOT },
			component: ManageSite
		},
		{
			path: '/sites/:siteId/settings',
			name: 'Settings',
			exact: true,
			customProps: { activeTab: NAV_ITEMS_INDEXES.SITE_SETTINGS, appName: ROUTE_APP_NAME.SETTINGS },
			component: ManageSite
		},
		{
			exact: true,
			customProps: { activeTab: NAV_ITEMS_INDEXES.MANAGE_APPS },
			name: 'Apps',
			path: '/sites/:siteId/apps',
			component: ManageSite
		},

		// App Layout
		{
			exact: true,
			name: 'Layout',
			title: 'Layout Editor',
			path: '/sites/:siteId/apps/layout',
			component: Layout
		},

		// App ApTag
		{
			exact: true,
			customProps: { activeTab: APT_NAV_ITEMS_INDEXES.CREATE_ADS, appName: ROUTE_APP_NAME.AP_TAG },
			name: 'Ap Tag',
			path: '/sites/:siteId/apps/ap-tag',
			component: ApTag
		},
		{
			exact: true,
			customProps: { activeTab: APT_NAV_ITEMS_INDEXES.MANAGE_ADS, appName: ROUTE_APP_NAME.AP_TAG },
			name: 'Manage',
			path: '/sites/:siteId/apps/ap-tag/manage',
			component: ApTag
		},

		// Amp
		{
			exact: true,
			customProps: { activeTab: AMP_NAV_ITEMS_INDEXES.CREATE_ADS, appName: ROUTE_APP_NAME.AMP },
			name: 'AMP',
			path: '/sites/:siteId/apps/amp',
			component: Amp
		},
		{
			exact: true,
			customProps: { activeTab: AMP_NAV_ITEMS_INDEXES.MANAGE_ADS, appName: ROUTE_APP_NAME.AMP },
			name: 'Manage',
			path: '/sites/:siteId/apps/amp/manage',
			component: Amp
		},
		// Amp new Tags
		{
			exact: true,
			customProps: {
				activeTab: AMP_NAV_ITEMS_INDEXES.CREATE_ADS_NEW,
				appName: ROUTE_APP_NAME.AMP_NEW
			},
			name: 'AMP New',
			path: '/sites/:siteId/apps/amp/new',
			component: Amp
		},
		// Amp new Tags
		{
			exact: true,
			customProps: {
				activeTab: AMP_NAV_ITEMS_INDEXES.MANAGE_ADS_NEW,
				appName: ROUTE_APP_NAME.AMP_NEW
			},
			name: 'Manage New',
			path: '/sites/:siteId/apps/amp/manage-new',
			component: Amp
		},

		// Innovative Ads
		{
			exact: true,
			customProps: {
				activeTab: IA_NAV_ITEMS_INDEXES.CREATE_ADS,
				appName: ROUTE_APP_NAME.INNOVATIVE_ADS
			},
			name: 'Innovative Ads',
			path: '/sites/:siteId/apps/innovative-ads',
			component: InnovativeAds
		},
		{
			exact: true,
			customProps: {
				activeTab: IA_NAV_ITEMS_INDEXES.MANAGE_ADS,
				appName: ROUTE_APP_NAME.INNOVATIVE_ADS
			},
			name: 'Manage',
			path: '/sites/:siteId/apps/innovative-ads/manage',
			component: InnovativeAds
		},
		// Manage Header Bidding
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_1,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_BIDDERS
			},
			name: 'Header Bidding',
			path: '/sites/:siteId/apps/header-bidding',
			component: HeaderBidding
		},
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_2,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_BIDDERS
			},
			name: 'Bidders',
			path: `/sites/:siteId/apps/header-bidding/${HB_NAV_ITEMS_INDEXES.TAB_2}`,
			component: HeaderBidding
		},
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_3,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_INVENTORY
			},
			name: 'Inventory',
			path: `/sites/:siteId/apps/header-bidding/${HB_NAV_ITEMS_INDEXES.TAB_3}`,
			component: HeaderBidding
		},
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_4,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_PREBID_SETTINGS
			},
			name: 'Prebid Settings',
			path: `/sites/:siteId/apps/header-bidding/${HB_NAV_ITEMS_INDEXES.TAB_4}`,
			component: HeaderBidding
		},
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_5,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_OPTIMIZATION
			},
			name: 'Optimization',
			path: `/sites/:siteId/apps/header-bidding/${HB_NAV_ITEMS_INDEXES.TAB_5}`,
			component: HeaderBidding
		},
		{
			exact: true,
			customProps: {
				activeTab: HB_NAV_ITEMS_INDEXES.TAB_6,
				appName: ROUTE_APP_NAME.HEADER_BIDDING_AMAZON_UAM
			},
			name: 'Amazon UAM',
			path: `/sites/:siteId/apps/header-bidding/${HB_NAV_ITEMS_INDEXES.TAB_6}`,
			component: HeaderBidding
		},

		// Reports
		{
			exact: true,
			name: 'Reports',
			path: '/reports',
			component: Reporting,
			title: 'Reporting',
			customProps: { activeTab: REPORTS_NAV_ITEMS_INDEXES.REPORT }
		},
		{
			exact: true,
			customProps: { activeTab: REPORTS_NAV_ITEMS_INDEXES.URL_UTM_REPORTING },
			name: 'URL/UTM Analytics',
			title: 'Reporting',
			path: '/reports/url-utm-analytics',
			component: Reporting
		},
		{
			exact: true,
			customProps: { activeTab: REPORTS_NAV_ITEMS_INDEXES.HB_ANALYTICS },
			name: 'HB Analytics',
			path: '/reports/hb-analytics',
			component: Reporting
		},
		{
			exact: true,
			name: ':siteId',
			path: '/reports/:siteId',
			customProps: { activeTab: REPORTS_NAV_ITEMS_INDEXES.REPORT },
			component: Reporting
		},
		// Integrations (Connect Google etc.)
		{
			exact: true,
			customProps: { activeTab: 'google' },
			name: 'Integrations',
			path: '/integrations',
			component: Integrations
		},
		{
			exact: true,
			customProps: { activeTab: 'google' },
			name: 'Google',
			path: '/integrations/google',
			component: Integrations
		},
		{
			exact: true,
			name: 'AdsTxt Authenticator',
			path: '/adsTxtManagement',
			customProps: { activeTab: ADSTXT_NAV_ITEMS_INDEXES.AUTHENTICATOR },
			component: AdsTxtManagement
		},
		{
			exact: true,
			name: 'AdsTxt Entries',
			path: '/adsTxtManagement/entries',
			customProps: { activeTab: ADSTXT_NAV_ITEMS_INDEXES.ENTRIES },
			component: AdsTxtManagement
		},
		{
			exact: true,
			name: 'Add Site',
			path: '/addSite',
			component: AddNewSite
		},
		{
			exact: true,
			name: 'Payment Details',
			path: '/payment',
			customProps: { activeTab: PAYMENT_NAV_ITEMS_INDEXES.DETAILS },
			component: Payment
		},
		{
			exact: true,
			name: 'Payment History',
			path: '/payment/history',
			customProps: { activeTab: PAYMENT_NAV_ITEMS_INDEXES.HISTORY },
			component: Payment
		},
		{
			exact: true,
			name: 'Payment Balance',
			path: '/payment/balance',
			customProps: {
				activeTab: PAYMENT_NAV_ITEMS_INDEXES.BALANCE,
				appName: ROUTE_APP_NAME.BALANCE_PAYMENT
			},
			component: Payment
		},

		// Admin Panel
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.SETTINGS,
				appName: ROUTE_APP_NAME.OPS_PANEL_ACCOUNTS
			},
			name: 'Admin Panel',
			path: '/admin-panel',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.SETTINGS,
				appName: ROUTE_APP_NAME.OPS_PANEL_SETTINGS
			},
			name: 'Settings',
			path: '/admin-panel/settings',
			component: OpsPanel
		},

		// Admin Panel - Info Panel
		{
			exact: true,
			customProps: { activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL },
			name: 'Info Panel',
			path: '/admin-panel/info-panel',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL,
				activeComponentTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL_QUICK_SNAPSHOT
			},
			name: 'Quick Snapshot',
			path: '/admin-panel/info-panel/quick-snapshot',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL,
				activeComponentTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL_REPORT_VITALS
			},
			name: 'Report Vitals',
			path: '/admin-panel/info-panel/report-vitals',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL,
				activeComponentTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL_REPORT_VITALS
			},
			name: 'Report Vitals',
			path: '/admin-panel/info-panel/report-vitals/:siteId',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL,
				activeComponentTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL_GLOBAL_REPORT_VITALS
			},
			name: 'Global Report Vitals',
			path: '/admin-panel/info-panel/global-report-vitals',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL,
				activeComponentTab: OP_NAV_ITEMS_INDEXES.INFO_PANEL_GLOBAL_REPORT_VITALS
			},
			name: 'Global Report Vitals',
			path: '/admin-panel/info-panel/global-report-vitals/:siteId',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: { activeTab: OP_NAV_ITEMS_INDEXES.SITES_MAPPING },
			name: 'Sites Mapping',
			path: '/admin-panel/sites-mapping',
			component: OpsPanel
		},
		{
			exact: true,
			customProps: {
				activeTab: OP_NAV_ITEMS_INDEXES.TOOLS,
				appName: ROUTE_APP_NAME.OPS_PANEL_TOOLS
			},
			name: 'Tools',
			path: '/admin-panel/tools',
			component: OpsPanel
		},
		{
			exact: true,
			name: 'User OnBoarding',
			path: '/onboarding',
			component: OnBoarding
		},
		{
			exact: true,
			path: '/notifications',
			component: NotificationHistory
		}
	]
};

export default ROUTES;
