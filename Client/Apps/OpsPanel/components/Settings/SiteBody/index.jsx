import React from 'react';
import { Row } from 'react-bootstrap';
import Settings from './Settings';
import Apps from './Apps';
import PagegroupContainer from '../../../containers/PagegroupContainer';

const SiteBody = props => {
	const { site, showNotification, saveSettings } = props;
	return (
		<React.Fragment>
			<Row>
				<Settings site={site} showNotification={showNotification} saveSettings={saveSettings} />
				<Apps />
			</Row>
			<Row>
				<PagegroupContainer site={site} showNotification={showNotification} />
			</Row>
		</React.Fragment>
	);
};

export default SiteBody;
