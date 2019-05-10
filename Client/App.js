import React from 'react';
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
	faPlus,
	faEnvelope,
	faKey,
	faUser,
	faLink,
	faEdit,
	faCopy,
	faCog,
	faTimes,
	faInfoCircle,
	faExclamationTriangle,
	faExclamationCircle,
	faCheckCircle,
	faExternalLinkAlt,
	faArrowUp,
	faArrowDown,
	faTools
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';
import ErrorBoundary from './Components/ErrorBoundary';
import Routes from './Routes';

library.add(
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus,
	faEnvelope,
	faKey,
	faUser,
	faLink,
	faEdit,
	faCopy,
	faCog,
	faTimes,
	faInfoCircle,
	faExclamationTriangle,
	faExclamationCircle,
	faCheckCircle,
	faExternalLinkAlt,
	faArrowUp,
	faArrowDown,
	faTools
);

const App = () => (
	// <div id="app">
	// </div>
	<ErrorBoundary>
		<Routes />
	</ErrorBoundary>
);

export default hot(App);
