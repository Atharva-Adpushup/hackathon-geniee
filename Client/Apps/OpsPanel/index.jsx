import React from 'react';
import DocumentTitle from 'react-document-title';

import OpsPanel from './components/index';
import '../../scss/apps/opsPanel/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Ops Panel" />
		<OpsPanel {...props} />
	</React.Fragment>
);

export default App;
