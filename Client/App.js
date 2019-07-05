/* eslint-disable func-names */
import React from 'react';
import { Helmet } from 'react-helmet';
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
		<Helmet>
			{/* Google Tag Manager */}
			<script>
				{(function(w, d, s, l, i) {
					// eslint-disable-next-line no-param-reassign
					w[l] = w[l] || [];
					w[l].push({
						'gtm.start': new Date().getTime(),
						event: 'gtm.js'
					});
					const f = d.getElementsByTagName(s)[0];

					const j = d.createElement(s);

					// eslint-disable-next-line eqeqeq
					const dl = l != 'dataLayer' ? `&l=${l}` : '';
					j.async = true;
					j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
					f.parentNode.insertBefore(j, f);
				})(window, document, 'script', 'dataLayer', 'GTM-NMS9P3Q')}
			</script>
			{/* End Google Tag Manager */}
		</Helmet>

		<NotificationContainer />
		<Routes />
	</ErrorBoundary>
);

export default hot(App);
