import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import SiteSettingsContainer from './containers/SiteSettingsContainer';
import '../../scss/pages/siteSettings/index.scss';

const App = props => (
	<Fragment>
		<DocumentTitle title="Site Settings" />

		<SiteSettingsContainer {...props} />
	</Fragment>
);

export default App;
