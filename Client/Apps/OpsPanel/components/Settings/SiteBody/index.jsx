import React from 'react';
import { Row } from 'react-bootstrap';
import Settings from './Settings';
import Apps from './Apps';
import Pagegroup from './Pagegroup';

const SiteBody = props => {
	const { site, showNotification, saveSettings } = props;
	return (
		<React.Fragment>
			<Row>
				<Settings site={site} showNotification={showNotification} saveSettings={saveSettings} />
				<Apps />
			</Row>
			<Row>
				<Pagegroup site={site} showNotification={showNotification} />
			</Row>
		</React.Fragment>
	);
};

export default SiteBody;
