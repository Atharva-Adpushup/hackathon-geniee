import React from 'react';
import { Tab, Nav, NavItem, Row, Col } from 'react-bootstrap';
import Sites from './Sites';

const Settings = () => (
	<div className="u-padding-v4">
		<Tab.Container id="ops-panel-settings-container" defaultActiveKey="sites">
			<Row className="clearfix">
				<Col sm={2}>
					<Nav bsStyle="pills" bsClass="ap-nav-pills nav" stacked>
						<NavItem eventKey="sites">Sites</NavItem>
						<NavItem eventKey="account">Account</NavItem>
					</Nav>
				</Col>
				<Col sm={10}>
					<Tab.Content animation>
						<Tab.Pane eventKey="sites">
							<Sites />
						</Tab.Pane>
						<Tab.Pane eventKey="account">Account Info</Tab.Pane>
					</Tab.Content>
				</Col>
			</Row>
		</Tab.Container>
	</div>
);

export default Settings;
