import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';

import Dashboard from './Pages/Dashboard';

const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
      <Route exact path="/dashboard" component={Dashboard} />
    </Switch>
  </Router>
);

export default Routes;
