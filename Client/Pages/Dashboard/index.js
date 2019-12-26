import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';

import DashboardContainer from './containers/index';
import '../../scss/pages/dashboard/index.scss';
import { dashboardWidgets } from './configs/commonConsts';

const Dashboard = props => (
	<Fragment>
		<DocumentTitle title="Dashboard" />
		<DashboardContainer {...props} widgetsList={dashboardWidgets} />
	</Fragment>
);

export default Dashboard;
