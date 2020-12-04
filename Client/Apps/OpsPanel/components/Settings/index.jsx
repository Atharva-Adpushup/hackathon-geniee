import React, { Component } from 'react';
import { Tab, Nav, NavItem, Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import SitesContainer from '../../containers/SitesContainer';
import AccountContainer from '../../containers/AccountContainer';
import ReportsPanelSettingsContainer from '../../containers/ReportsPanelSettingsContainer';

class Settings extends Component {
	state = {
		activeKey: 'account'
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	render() {
		const { activeKey } = this.state;
		const { customProps } = this.props;
		return (
			<div className="u-padding-v4">
				<Tab.Container
					id="ops-panel-settings-container"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Row className="clearfix">
						<Col sm={2}>
							<Nav bsStyle="pills" bsClass="ap-nav-pills nav" stacked>
								<NavItem eventKey="account">Account</NavItem>
								<NavItem eventKey="sites">Sites</NavItem>
							</Nav>
						</Col>
						<Col sm={10}>
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
}

export default Settings;
