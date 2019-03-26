import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';
import IntegrationsContainer from './containers/index';

const Integrations = props => (
	<Fragment>
		<Helmet>
			<title>Integrations</title>
		</Helmet>
		<IntegrationsContainer {...props} />
	</Fragment>
);

export default Integrations;
