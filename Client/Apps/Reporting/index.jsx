import React from 'react';
import DocumentTitle from 'react-document-title';

import ReportContainer from './containers/index';
import '../../scss/apps/reporting/index.scss';

const App = props => {
	const { title } = props;
	return (
		<React.Fragment>
			<DocumentTitle title={title} />
			<ReportContainer isCustomizeChartLegend {...props} />
		</React.Fragment>
	);
};

export default App;
