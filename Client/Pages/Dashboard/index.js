import React, { Fragment } from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import ActionCard from '../../Components/ActionCard/index';

const Dashboard = () => (
	<Fragment>
		<Helmet>
			<title>Dashboard</title>
		</Helmet>

		<ActionCard>
			<Nav bsStyle="tabs" activeKey={1}>
				<NavItem eventKey={1}>AdPushup Header Code</NavItem>
				<NavItem eventKey={2}>Ad code Generator</NavItem>
				<NavItem eventKey={3}>Ads List</NavItem>
				<NavItem eventKey={4}>Ads.txt Config</NavItem>
			</Nav>
			<div style={{ padding: '20px' }}>
				<p>
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
					#AdX google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0 #DMX and OpenX openx.com,
				</p>
			</div>
		</ActionCard>
	</Fragment>
);

export default Dashboard;
