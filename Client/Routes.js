import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Dashboard from './Pages/Dashboard';

const Routes = () => (
  <Router>
    <Route exact path="/dashboard" component={Dashboard} />
  </Router>
);

export default Routes;
