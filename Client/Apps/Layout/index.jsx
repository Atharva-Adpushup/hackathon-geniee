import React from 'react';
import DocumentTitle from 'react-document-title';
import Home from './components/Home/index';
import '../../scss/apps/layout/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Layout Editor" />
		<Home {...props} />
	</React.Fragment>
);
export default App;
