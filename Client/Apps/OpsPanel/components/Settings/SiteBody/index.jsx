import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import PagegroupContainer from '../../../containers/PagegroupContainer';
import AppsContainer from '../../../containers/AppsContainer';
import SettingsContainer from '../../../containers/SettingsContainer';
import ApLiteContainer from '../../../containers/ApLiteContainer';
import SiteLevelBeforeJSContainer from '../../../containers/SiteLevelBeforeJSContainer';

const SiteBody = props => {
	const { site, showNotification, saveSettings } = props;
	return (
		<React.Fragment>
			<Row>
				<SettingsContainer
					site={site}
					showNotification={showNotification}
					saveSettings={saveSettings}
				/>
				<AppsContainer site={site} showNotification={showNotification} />
			</Row>
			<Row>
				<ApLiteContainer site={site} showNotification={showNotification} />
				<PagegroupContainer site={site} showNotification={showNotification} />
				<SiteLevelBeforeJSContainer site={site} showNotification={showNotification} />
			</Row>
		</React.Fragment>
	);
};

export default SiteBody;
