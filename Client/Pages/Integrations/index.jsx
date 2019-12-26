import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import IntegrationsContainer from './containers/index';
import '../../scss/pages/integrations/index.scss';

const Integrations = props => (
	<Fragment>
		<DocumentTitle title="Integrations" />

		<IntegrationsContainer {...props} />
	</Fragment>
);

export default Integrations;
