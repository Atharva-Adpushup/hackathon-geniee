import React from 'react';
import { Tab, Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import SitesContainer from '../../containers/SitesContainer';
import AccountContainer from '../../containers/AccountContainer';
import ReportsPanelSettingsContainer from '../../containers/ReportsPanelSettingsContainer';

function Settings(props) {
	const { customProps, activeKey } = props;
	return (
		<div className="u-padding-v4">
			<Tab.Container id="ops-panel-settings-container" activeKey={activeKey}>
				<Row className="clearfix">
					<Col sm={12}>
						<Tab.Content animation>
							{activeKey === 'account' ? (
								<Tab.Pane eventKey="account">
									<AccountContainer customProps={customProps} />
									<ReportsPanelSettingsContainer customProps={customProps} />
								</Tab.Pane>
							) : (
								<Tab.Pane eventKey="sites">
									<SitesContainer customProps={customProps} />
								</Tab.Pane>
							)}
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</div>
	);
}

export default Settings;
