import React, { Suspense, lazy } from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import { NAV_ITEMS_INDEXES } from './Pages/ManageSite/constants/index';
import { IA_NAV_ITEMS_INDEXES } from './Apps/InnovativeAds/configs/commonConsts';
import { APT_NAV_ITEMS_INDEXES } from './Apps/ApTag/configs/commonConsts';
import { REPORTS_NAV_ITEMS_INDEXES } from './Apps/Reporting/configs/commonConsts';
import { PAYMENT_NAV_ITEMS_INDEXES } from './Pages/Payment/configs/commonConsts';
import { ADSTXT_NAV_ITEMS_INDEXES } from './Pages/AdsTxtManagement/configs/commonConsts';
import { NAV_ITEMS_INDEXES as HB_NAV_ITEMS_INDEXES } from './Apps/HeaderBidding/constants';

import history from './helpers/history';
import PublicOnlyRoute from './Components/PublicOnlyRoute';
import PrivateRoute from './Components/PrivateRoute';
import authService from './services/authService';
import Loader from './Components/Loader';
import ShellContainer from './Containers/ShellContainer';

import Login from './Pages/Login';
import Signup from './Pages/Signup';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';

const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './Pages/Dashboard'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './Pages/Sites'));
const Integrations = lazy(() =>
	import(/* webpackChunkName: "integrations" */ './Pages/Integrations/index')
);
const AdsTxtManagement = lazy(() =>
	import(/* webpackChunkName: "adsTxtManagement" */ './Pages/AdsTxtManagement')
);
const Payment = lazy(() => import(/* webpackChunkName: "payment" */ './Pages/Payment'));
const ApTag = lazy(() => import(/* webpackChunkName: "apTag" */ './Apps/ApTag/index'));
const InnovativeAds = lazy(() =>
	import(/* webpackChunkName: "innovativeAds" */ './Apps/InnovativeAds/index')
);
const Reporting = lazy(() =>
	import(/* webpackChunkName: "innovativeAds" */ './Apps/Reporting/index')
);
const ManageSite = lazy(() =>
	import(/* webpackChunkName: "manageSite" */ './Pages/ManageSite/index')
);
const HeaderBidding = lazy(() =>
	import(/* webpackChunkName: "headerBidding" */ './Apps/HeaderBidding')
);
const ErrorPage = lazy(() => import(/* webpackChunkName: "error" */ './Pages/ErrorPage/index'));
const OnBoarding = lazy(() => import(/* webpackChunkName: "onBoarding" */ './Pages/OnBoarding'));
const AddNewSite = lazy(() => import(/* webpackChunkName: "addNewSite" */ './Pages/AddNewSite'));
const Layout = lazy(() => import(/* webpackChunkName: "layout" */ './Apps/Layout/index'));
const OpsPanel = lazy(() => import(/* webpackChunkName: "opsPanel" */ './Apps/OpsPanel/index'));

const UserRoutes = () => (
	<Router history={history}>
		<Suspense fallback={<Loader height="100vh" />}>
			<Switch>
				{/* Public Routes */}
				<Route
					exact
					path="/"
					render={() =>
						authService.isLoggedin() ? <Redirect to="/dashboard" /> : <Redirect to="/login" />
					}
				/>

				<PublicOnlyRoute exact path="/login" component={Login} />
				<PublicOnlyRoute exact path="/signup" component={Signup} />
				<PublicOnlyRoute exact path="/forgot-password" component={ForgotPassword} />
				<PublicOnlyRoute exact path="/reset-password" component={ResetPassword} />

				{/* Private Routes */}
				<ShellContainer>
					<Route exact name="Error" path="/error" render={() => <ErrorPage />} />
					<PrivateRoute exact name="Dashboard" path="/dashboard" component={Dashboard} />

					{/** Sites & ManageSite */}
					<PrivateRoute exact name="My Sites" path="/sites" component={Sites} />
					<PrivateRoute
						exact
						customProps={{ activeTab: NAV_ITEMS_INDEXES.QUICK_SNAPSHOT }}
						name=":siteId"
						path="/sites/:siteId"
						component={ManageSite}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: NAV_ITEMS_INDEXES.SITE_SETTINGS }}
						name="Settings"
						path="/sites/:siteId/settings"
						component={ManageSite}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: NAV_ITEMS_INDEXES.MANAGE_APPS }}
						name="Apps"
						path="/sites/:siteId/apps"
						component={ManageSite}
					/>

					{/** App Layout */}
					<PrivateRoute
						exact
						name="Layout Editor"
						path="/sites/:siteId/apps/layout"
						component={Layout}
					/>

					{/** App ApTag */}
					<PrivateRoute
						exact
						customProps={{ activeTab: APT_NAV_ITEMS_INDEXES.CREATE_ADS }}
						name="Ap Tag"
						path="/sites/:siteId/apps/ap-tag"
						component={ApTag}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: APT_NAV_ITEMS_INDEXES.MANAGE_ADS }}
						name="Manage"
						path="/sites/:siteId/apps/ap-tag/manage"
						component={ApTag}
					/>

					{/** Innovative Ads */}
					<PrivateRoute
						exact
						customProps={{ activeTab: IA_NAV_ITEMS_INDEXES.CREATE_ADS }}
						name="Innovative Ads"
						path="/sites/:siteId/apps/innovative-ads"
						component={InnovativeAds}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: IA_NAV_ITEMS_INDEXES.MANAGE_ADS }}
						name="Manage"
						path="/sites/:siteId/apps/innovative-ads/manage"
						component={InnovativeAds}
					/>

					{/* Manage Header Bidding */}
					<PrivateRoute
						exact
						customProps={{ activeTab: HB_NAV_ITEMS_INDEXES.TAB_1 }}
						name="Header Bidding"
						path="/sites/:siteId/apps/header-bidding"
						component={HeaderBidding}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: HB_NAV_ITEMS_INDEXES.TAB_2 }}
						name="Tab 2"
						path="/sites/:siteId/apps/header-bidding/tab-2"
						component={HeaderBidding}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: HB_NAV_ITEMS_INDEXES.TAB_3 }}
						name="Tab 3"
						path="/sites/:siteId/apps/header-bidding/tab-3"
						component={HeaderBidding}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: HB_NAV_ITEMS_INDEXES.TAB_4 }}
						name="Tab 4"
						path="/sites/:siteId/apps/header-bidding/tab-4"
						component={HeaderBidding}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: HB_NAV_ITEMS_INDEXES.TAB_5 }}
						name="Tab 5"
						path="/sites/:siteId/apps/header-bidding/tab-5"
						component={HeaderBidding}
					/>

					<PrivateRoute
						exact
						name=" Account Reports"
						path="/reports"
						customProps={{ activeTab: REPORTS_NAV_ITEMS_INDEXES.ACCOUNT }}
						component={Reporting}
					/>
					<PrivateRoute
						exact
						name="Site Level Reports"
						path="/reports/site"
						customProps={{ activeTab: REPORTS_NAV_ITEMS_INDEXES.SITE }}
						component={Reporting}
					/>
					<PrivateRoute exact name=":siteId" path="/reporting/:siteId" component={Reporting} />

					{/** Integrations (Connect Google etc.) */}
					<PrivateRoute
						exact
						customProps={{ activeTab: 'google' }}
						name="Integrations"
						path="/integrations"
						component={Integrations}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: 'google' }}
						name="Google"
						path="/integrations/google"
						component={Integrations}
					/>

					<PrivateRoute
						exact
						name="AdsTxt Authenticator"
						path="/adsTxtManagement"
						customProps={{ activeTab: ADSTXT_NAV_ITEMS_INDEXES.AUTHENTICATOR }}
						component={AdsTxtManagement}
					/>
					<PrivateRoute
						exact
						name="AdsTxt Entries"
						path="/adsTxtManagement/entries"
						customProps={{ activeTab: ADSTXT_NAV_ITEMS_INDEXES.ENTRIES }}
						component={AdsTxtManagement}
					/>
					<PrivateRoute exact name="Add Site" path="/addSite" component={AddNewSite} />
					<PrivateRoute
						exact
						name="Payment Details"
						path="/payment"
						customProps={{ activeTab: PAYMENT_NAV_ITEMS_INDEXES.DETAILS }}
						component={Payment}
					/>
					<PrivateRoute
						exact
						name="Payment History"
						path="/payment/history"
						customProps={{ activeTab: PAYMENT_NAV_ITEMS_INDEXES.HISTORY }}
						component={Payment}
					/>

					{/** Ops Panel */}
					<PrivateRoute
						exact
						customProps={{ activeTab: OP_NAV_ITEMS_INDEXES.SITES_MAPPING }}
						name="Ops Panel"
						path="/ops-panel"
						component={OpsPanel}
					/>
					<PrivateRoute
						exact
						customProps={{ activeTab: OP_NAV_ITEMS_INDEXES.LIVE_SITES_MAPPING }}
						name="Live Sites"
						path="/ops-panel/live-sites"
						component={OpsPanel}
					/>
					<PrivateRoute exact name="User OnBoarding" path="/onboarding" component={OnBoarding} />
				</ShellContainer>
			</Switch>
		</Suspense>
	</Router>
);

export default UserRoutes;
