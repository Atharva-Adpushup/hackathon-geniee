import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import ManageSiteContainer from './containers/ManageSiteContainer';
import '../../scss/pages/manageSites/index.scss';

const App = props => (
	<Fragment>
		<Helmet>
			<title>Manage Site</title>
		</Helmet>

		<ManageSiteContainer {...props} />
	</Fragment>
);

export default App;
