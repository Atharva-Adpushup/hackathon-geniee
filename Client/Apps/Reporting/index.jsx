import React from 'react';
import DocumentTitle from 'react-document-title';

import PanelContainer from './containers/PanelContainer';
import '../../scss/apps/reporting/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Reporting" />
		<PanelContainer {...props} />
	</React.Fragment>
);

export default App;
