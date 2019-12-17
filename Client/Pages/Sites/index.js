import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import MySitesContainer from './containers/MySitesContainer';
import '../../scss/pages/mySites/index.scss';

const App = props => (
	<Fragment>
		<DocumentTitle title="My Sites" />

		<MySitesContainer {...props} />
	</Fragment>
);

export default App;
