/* eslint-disable func-names */
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
	faTools,
	faSort,
	faCheck,
	faChevronRight,
	faPlay,
	faPause,
	faQuestion
} from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';
import ErrorBoundary from './Components/ErrorBoundary';
import NotificationContainer from './Containers/NotificationContainer';
import Routes from './Routes';
import NotificationContainer from './Containers/NotificationContainer';

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
	faTools,
	faSort,
	faCheck,
	faChevronRight,
	faPlay,
	faPause,
	faQuestion
);

const App = () => (
	<ErrorBoundary>
		<NotificationContainer />
		<Routes />
	</ErrorBoundary>
);

export default hot(App);
