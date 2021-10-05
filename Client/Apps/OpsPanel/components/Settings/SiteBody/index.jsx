import React from 'react';
import { Row } from '@/Client/helpers/react-bootstrap-imports';
import PagegroupContainer from '../../../containers/PagegroupContainer';
import SizeMappingContainer from '../../../containers/SizeMappingContainer';
import AppsContainer from '../../../containers/AppsContainer';
import SettingsContainer from '../../../containers/SettingsContainer';
import ApLiteContainer from '../../../containers/ApLiteContainer';
import PnPContainer from '../../../containers/PnpContainer';
import LineItemTypeRefreshContainer from '../../../containers/LineItemTypeRefreshContainer';

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
				<PnPContainer site={site} showNotification={showNotification} />
				<PagegroupContainer
					dataForAuditLogs={dataForAuditLogs}
					site={site}
					showNotification={showNotification}
				/>
				<LineItemTypeRefreshContainer site={site} />
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
