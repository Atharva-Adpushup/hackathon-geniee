import React from 'react';
import { Helmet } from 'react-helmet';

import Home from './components/Home/index';
import '../../scss/apps/apTag/index.scss';

const App = props => (
	<React.Fragment>
		<Helmet>
			<title>ApTag</title>
		</Helmet>

		<Home {...props} />
	</React.Fragment>
);

export default App;
