import React from 'react';
import Routes from './Routes';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

library.add(faBars);

const App = () => (
  <div id="app">
    <Routes />
  </div>
);

export default App;
