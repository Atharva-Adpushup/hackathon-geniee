import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import ManageSite from './components/index';
import '../../scss/pages/manageSites/index.scss';

const App = props => (
	<Fragment>
		<Helmet>
			<title>Manage Site</title>
		</Helmet>

		<ManageSite {...props} />
	</Fragment>
);

export default App;
