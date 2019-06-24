import React, { Component } from 'react';
import { Tab, Nav, NavItem, Row, Col } from 'react-bootstrap';
import SitesContainer from '../../containers/SitesContainer';
import Account from './Account';

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
										<Account />
									</Tab.Pane>
								) : (
									<Tab.Pane eventKey="sites">
										<SitesContainer />
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
