import React from 'react';
import { Helmet } from 'react-helmet';

import HomeContainer from './containers/HomeContainer';
import '../../scss/apps/innovativeAds/index.scss';

const App = props => (
	<React.Fragment>
		<Helmet>
			<title>Innovative Ads</title>
		</Helmet>
		<HomeContainer {...props} />
	</React.Fragment>
);

export default App;
