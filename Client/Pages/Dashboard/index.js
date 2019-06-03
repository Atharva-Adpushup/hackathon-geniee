import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import DashboardContainer from './containers/index';
import '../../scss/pages/dashboard/index.scss';

const Dashboard = props => (
	<Fragment>
		<Helmet>
			<title>Dashboard</title>
		</Helmet>
		<DashboardContainer {...props} />
	</Fragment>
);

export default Dashboard;
