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
	faTrash,
	faCode,
	faCheck,
	faChevronRight,
	faPlay,
	faPause,
	faQuestion,
	faQuestionCircle,
	faMailBulk,
	faDownload,
	faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'bootstrap-sass/assets/stylesheets/_bootstrap.scss';
import ErrorBoundary from './Components/ErrorBoundary';
import NotificationContainer from './Containers/NotificationContainer';
import CopiedNotificationContainer from './Containers/CopiedNotificationContainer';
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
	faTools,
	faSort,
	faTrash,
	faCode,
	faCheck,
	faChevronRight,
	faPlay,
	faPause,
	faQuestion,
	faQuestionCircle,
	faMailBulk,
	faDownload,
	faSignInAlt
);

const App = () => (
	<ErrorBoundary>
		<Routes />
		<NotificationContainer />
		<CopiedNotificationContainer />
	</ErrorBoundary>
);

export default hot(App);
