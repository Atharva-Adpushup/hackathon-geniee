import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import SiteSettingsContainer from './containers/SiteSettingsContainer';
import '../../scss/pages/siteSettings/index.scss';

const App = props => (
	<Fragment>
		<Helmet>
			<title>Site Settings</title>
		</Helmet>

		<SiteSettingsContainer {...props} />
	</Fragment>
);

export default App;
