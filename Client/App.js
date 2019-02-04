import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

import { hot } from 'react-hot-loader/root';
import Routes from './Routes';
import Shell from './Components/Shell';
import ErrorBoundary from './Components/ErrorBoundary';

library.add(
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
);

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

export default hot(App);
