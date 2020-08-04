import React from 'react';
import DocumentTitle from 'react-document-title';

import ReportPanel from './components/index';
import '../../scss/apps/reporting/index.scss';

const App = props => (
	<React.Fragment>
		<DocumentTitle title="Reporting" />
		<ReportPanel isCustomizeChartLegend {...props} />
	</React.Fragment>
);

export default App;
