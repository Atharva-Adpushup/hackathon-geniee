import React from 'react';
import { Helmet } from 'react-helmet';

import OpsPanel from './components/index';
import '../../scss/apps/opsPanel/index.scss';

const App = props => (
	<React.Fragment>
		<Helmet>
			<title>Ops Panel</title>
		</Helmet>
		<OpsPanel {...props} />
	</React.Fragment>
);

export default App;
