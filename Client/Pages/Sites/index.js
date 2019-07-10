import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import MySitesContainer from './containers/MySitesContainer';
import '../../scss/pages/mySites/index.scss';

const App = props => (
	<Fragment>
		<Helmet>
			<title>My Sites</title>
		</Helmet>

		<MySitesContainer {...props} />
	</Fragment>
);

export default App;
