import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './Routes';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import Shell from './Components/Shell';
import ErrorBoundary from './Components/ErrorBoundary';

library.add(faBars, faTachometerAlt);

const App = () => (
  <div id="app">
    <Router>
      <Shell>
        <ErrorBoundary>
          <Routes />
        </ErrorBoundary>
      </Shell>
    </Router>
  </div>
);

export default App;
