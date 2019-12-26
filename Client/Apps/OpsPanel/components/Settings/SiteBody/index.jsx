import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import Settings from './Settings';
import PagegroupContainer from '../../../containers/PagegroupContainer';
import AppsContainer from '../../../containers/AppsContainer';

const SiteBody = props => {
	const { site, showNotification, saveSettings } = props;
	return (
		<React.Fragment>
			<Row>
				<Settings site={site} showNotification={showNotification} saveSettings={saveSettings} />
				<AppsContainer site={site} showNotification={showNotification} />
			</Row>
			<Row>
				<PagegroupContainer site={site} showNotification={showNotification} />
			</Row>
		</React.Fragment>
	);
};

export default SiteBody;
