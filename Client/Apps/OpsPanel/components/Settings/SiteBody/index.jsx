import React from 'react';
import { Row } from 'react-bootstrap';
import Settings from './Settings';
import Apps from './Apps';

const SiteBody = props => (
	<Row>
		<Settings {...props} />
		<Apps />
	</Row>
);

export default SiteBody;
