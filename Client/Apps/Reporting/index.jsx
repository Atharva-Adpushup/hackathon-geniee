import React from 'react';
import { Helmet } from 'react-helmet';

import PanelContainer from './containers/PanelContainer';
import '../../scss/apps/reporting/index.scss';

const App = props => (
	<React.Fragment>
		<Helmet>
			<title>Reporting</title>
		</Helmet>
		<PanelContainer {...props} />
	</React.Fragment>
);

export default App;
