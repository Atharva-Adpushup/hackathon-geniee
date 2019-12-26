import React from 'react';
import DocumentTitle from 'react-document-title';

import HomeContainer from './containers/HomeContainer';
import '../../scss/apps/innovativeAds/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Innovative Ads" />

		<HomeContainer {...props} />
	</React.Fragment>
);

export default App;
