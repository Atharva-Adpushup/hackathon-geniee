import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import PagegroupContainer from '../../../containers/PagegroupContainer';
import SizeMappingContainer from '../../../containers/SizeMappingContainer';
import AppsContainer from '../../../containers/AppsContainer';
import SettingsContainer from '../../../containers/SettingsContainer';
import ApLiteContainer from '../../../containers/ApLiteContainer';
import SiteLevelBeforeJSContainer from '../../../containers/SiteLevelBeforeJSContainer';

const SiteBody = props => {
	const { site, showNotification, saveSettings, dataForAuditLogs } = props;
	return (
		<React.Fragment>
			<Row>
				<SettingsContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
					saveSettings={saveSettings}
				/>
				<AppsContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
			</Row>
			<Row>
				<ApLiteContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
				<PagegroupContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
				<SiteLevelBeforeJSContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
				<SizeMappingContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
			</Row>
		</React.Fragment>
	);
};

export default SiteBody;
