import React, { Suspense, lazy } from 'react';
import { Router, Route, Redirect, Switch } from 'react-router-dom';

import history from './helpers/history';
import PublicOnlyRoute from './Components/PublicOnlyRoute';
import PrivateRoute from './Components/PrivateRoute';
import authService from './services/authService';
import Loader from './Components/Loader';
import Shell from './Components/Shell';

import Login from './Pages/Login';
import Signup from './Pages/Signup';

const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './Pages/Dashboard'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './Pages/Sites'));
const Reporting = lazy(() => import(/* webpackChunkName: "reporting" */ './Pages/Reporting'));
const ByodPanel = lazy(() => import(/* webpackChunkName: "byodPanel" */ './Pages/ByodPanel'));
const AdsTxtManagement = lazy(() =>
	import(/* webpackChunkName: "adsTxtManagement" */ './Pages/AdsTxtManagement')
);
const AddNewSite = lazy(() => import(/* webpackChunkName: "addNewSite" */ './Pages/AddNewSite'));
const Payment = lazy(() => import(/* webpackChunkName: "payment" */ './Pages/Payment'));
const PaymentSettings = lazy(() =>
	import(/* webpackChunkName: "paymentSettings" */ './Pages/PaymentSettings')
);

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

				{/* Private Routes */}
				<Shell>
					<PrivateRoute exact path="/dashboard" component={Dashboard} />
					<PrivateRoute exact path="/sites" component={Sites} />
					<PrivateRoute exact path="/reporting" component={Reporting} />
					<PrivateRoute exact path="/byodPanel" component={ByodPanel} />
					<PrivateRoute exact path="/adsTxtManagement" component={AdsTxtManagement} />
					<PrivateRoute exact path="/addSite" component={AddNewSite} />
					<PrivateRoute exact path="/payment" component={Payment} />
					<PrivateRoute exact path="/paymentSettings" component={PaymentSettings} />
				</Shell>
			</Switch>
		</Suspense>
	</Router>
);

export default UserRoutes;
