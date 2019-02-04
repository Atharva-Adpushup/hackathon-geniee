import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import { library } from '@fortawesome/fontawesome-svg-core';
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
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';

import ErrorBoundary from './Components/ErrorBoundary';
import Routes from './Routes';
import Shell from './Components/Shell';

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
