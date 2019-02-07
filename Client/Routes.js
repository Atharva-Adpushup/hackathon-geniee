import React, { Suspense, lazy } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import Loader from './Components/Loader';

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
// const ApTag = lazy(() => import(/* webpackChunkName: "apTag" */ './Apps/ApTag/index'));

const Routes = () => (
	<Suspense fallback={<Loader />}>
		<Switch>
			<Route exact path="/" render={() => <Redirect to="/dashboard" />} />
			<Route exact path="/dashboard" render={() => <Dashboard />} />
			<Route exact path="/sites" render={() => <Sites />} />
			<Route exact path="/reporting" render={() => <Reporting />} />
			<Route exact path="/byodPanel" render={() => <ByodPanel />} />
			<Route exact path="/adsTxtManagement" render={() => <AdsTxtManagement />} />
			<Route exact path="/addSite" render={() => <AddNewSite />} />
			<Route exact path="/payment" render={() => <Payment />} />
			<Route exact path="/paymentSettings" render={() => <PaymentSettings />} />
			{/* <Route exact path="/:siteId/ap-tag" render={() => <ApTag />} /> */}
		</Switch>
	</Suspense>
);

export default Routes;
