import React from 'react';
import DocumentTitle from 'react-document-title';
import Home from './components/Home/index';
import '../../scss/apps/layout/index.scss';

const App = props => {
	const { title } = props;
	return (
		<React.Fragment>
			<DocumentTitle title={title} />
			<Home {...props} />
		</React.Fragment>
	);
};
export default App;
