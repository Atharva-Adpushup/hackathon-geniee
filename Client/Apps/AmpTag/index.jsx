import React from 'react';
import DocumentTitle from 'react-document-title';

import HomeContainer from './containers/HomeContainer';
import '../../scss/apps/amp/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="AmpTag" />
		<HomeContainer {...props} />
	</React.Fragment>
);

export default App;
