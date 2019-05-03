import React, { Fragment } from 'react';
import DashboardContainer from './containers/index';
import '../../scss/pages/dashboard/index.scss';

const Dashboard = props => (
	<Fragment>
		<DashboardContainer {...props} />
	</Fragment>
);

export default Dashboard;
