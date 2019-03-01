import React, { Suspense, lazy } from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

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
const Reporting = lazy(() => import(/* webpackChunkName: "reporting" */ './Pages/Reporting'));
const ByodPanel = lazy(() => import(/* webpackChunkName: "byodPanel" */ './Pages/ByodPanel'));
const AdsTxtManagement = lazy(() =>
	import(/* webpackChunkName: "adsTxtManagement" */ './Pages/AdsTxtManagement')
);
const Payment = lazy(() => import(/* webpackChunkName: "payment" */ './Pages/Payment'));
const PaymentHistory = lazy(() =>
	import(/* webpackChunkName: "paymentHistory" */ './Pages/PaymentHistory')
);
const PaymentSettings = lazy(() =>
	import(/* webpackChunkName: "paymentSettings" */ './Pages/PaymentSettings')
);
const ApTag = lazy(() => import(/* webpackChunkName: "apTag" */ './Apps/ApTag/index'));
const InnovativeAds = lazy(() =>
	import(/* webpackChunkName: "innovativeAds" */ './Apps/InnovativeAds/index')
);
const ManageSite = lazy(() =>
	import(/* webpackChunkName: "innovativeAds" */ './Pages/ManageSite/index')
);
const ErrorPage = lazy(() => import(/* webpackChunkName: "error" */ './Pages/ErrorPage/index'));
const OnBoarding = lazy(() => import(/* webpackChunkName: "onBoarding" */ './Pages/OnBoarding'));
const AddNewSite = lazy(() => import(/* webpackChunkName: "addNewSite" */ './Pages/AddNewSite'));

const UserRoutes = () => (
	<Router history={history}>
		<Suspense fallback={<Loader />}>
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
					<Route exact path="/error" render={() => <ErrorPage />} />
					<PrivateRoute exact path="/dashboard" component={Dashboard} />
					<PrivateRoute exact path="/sites" component={Sites} />
					<PrivateRoute exact path="/sites/:siteId/settings" component={SiteSettings} />
					<PrivateRoute exact path="/reporting" component={Reporting} />
					<PrivateRoute exact path="/byodPanel" component={ByodPanel} />
					<PrivateRoute exact path="/adsTxtManagement" component={AdsTxtManagement} />
					<PrivateRoute exact path="/addSite" component={AddNewSite} />
					<PrivateRoute exact path="/payment" component={Payment} />
					<PrivateRoute exact path="/paymentHistory" component={PaymentHistory} />
					<PrivateRoute exact path="/paymentSettings" component={PaymentSettings} />
					<PrivateRoute exact path="/ap-tag/:siteId" component={ApTag} />
					<PrivateRoute exact path="/onboarding" component={OnBoarding} />
					<PrivateRoute exact path="/add-site" component={AddNewSite} />
				</ShellContainer>
			</Switch>
		</Suspense>
	</Router>
);

export default UserRoutes;
