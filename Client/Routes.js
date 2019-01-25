import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import Loader from './Components/Loader/';

const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './Pages/Dashboard'));
const Sites = lazy(() => import(/* webpackChunkName: "sites" */ './Pages/Sites'));
const Reporting = lazy(() => import(/* webpackChunkName: "reporting" */ './Pages/Reporting'));
const ByodPanel = lazy(() => import(/* webpackChunkName: "byodPanel" */ './Pages/ByodPanel'));
const AdsTxtManagement = lazy(() => import(/* webpackChunkName: "adsTxtManagement" */ './Pages/AdsTxtManagement'));
const AddNewSite = lazy(() => import(/* webpackChunkName: "addNewSite" */ './Pages/AddNewSite'));
const Payment = lazy(() => import(/* webpackChunkName: "payment" */ './Pages/Payment'));
const PaymentSettings = lazy(() => import(/* webpackChunkName: "paymentSettings" */ './Pages/PaymentSettings'));

const Routes = () => (
  <Suspense fallback={<Loader />} >
    <Switch>
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/sites" component={Sites} />
      <Route exact path="/reporting" component={Reporting} />
      <Route exact path="/byodPanel" component={ByodPanel} />
      <Route exact path="/adsTxtManagement" component={AdsTxtManagement} />
      <Route exact path="/addSite" component={AddNewSite} />
      <Route exact path="/payment" component={Payment} />
      <Route exact path="/paymentSettings" component={PaymentSettings} />
    </Switch>
  </Suspense>
);

export default Routes;
