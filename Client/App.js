import React from 'react';
import Routes from './Routes';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

library.add(faBars, faTachometerAlt);

const App = () => (
  <div id="app">
    <Routes />
  </div>
);

export default App;
