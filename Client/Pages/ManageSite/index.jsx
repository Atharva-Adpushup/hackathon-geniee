import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import ManageSiteContainer from './containers/ManageSiteContainer';
import '../../scss/pages/manageSites/index.scss';

const App = props => (
	<Fragment>
		<DocumentTitle title="Manage Site" />

		<ManageSiteContainer {...props} />
	</Fragment>
);

export default App;
