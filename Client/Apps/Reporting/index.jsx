import React from 'react';
import DocumentTitle from 'react-document-title';

import ReportContainer from './containers/index';
import '../../scss/apps/reporting/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Reporting" />
		<ReportContainer {...props} />
	</React.Fragment>
);

export default App;
