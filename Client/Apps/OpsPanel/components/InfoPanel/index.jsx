import React, { Component } from 'react';
import { Tab, Nav, NavItem, Row, Col } from 'react-bootstrap';
import {
	INFO_PANEL_IDENTIFIERS,
	QUICK_SNAPSHOTS_WIDGETS,
	WIDGETS_INFO
} from '../../configs/commonConsts';
import QuickSnapshot from './QuickSnapshot';
// import RegexVerification from './RegexVerification/index';
// import EnableHbBidder from './EnableHbBidder';
// import BackupAds from './BackupAds/index';
// import TopXPathMissAndModeURL from './TopXPathMissAndModeURL ';
// import LostFoundLiveSites from './LostFoundLiveSites/index';

class InfoPanel extends Component {
	state = {
		activeKey: INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	renderContent = () => {
		const { activeKey } = this.state;
		// const { networkConfig, sites, showNotification, updateNetworkConfig } = this.props;

		switch (activeKey) {
			default:
			case INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT:
				return (
					<QuickSnapshot
						{...this.props}
						widgetsName={WIDGETS_INFO}
						widgetsList={QUICK_SNAPSHOTS_WIDGETS}
					/>
				);
			case INFO_PANEL_IDENTIFIERS.GLOBAL_VITALS:
				return <div>Global Vitals</div>;
			case INFO_PANEL_IDENTIFIERS.ACCOUNT_VITALS:
				return <div>Account Vitals</div>;
		}
	};

	render() {
		const { activeKey } = this.state;
		return (
			<div className="u-padding-v4">
				<Tab.Container
					id="ops-panel-infopanel-container"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Row className="clearfix">
						<Col sm={2}>
							<Nav bsStyle="pills" bsClass="ap-nav-pills nav" stacked>
								<NavItem eventKey={INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT}>Quick Snapshot</NavItem>
								<NavItem eventKey={INFO_PANEL_IDENTIFIERS.GLOBAL_VITALS}>Global Vitals</NavItem>
								<NavItem eventKey={INFO_PANEL_IDENTIFIERS.ACCOUNT_VITALS}>Account Vitals</NavItem>
							</Nav>
						</Col>
						<Col sm={10}>
							<Tab.Content animation>{this.renderContent()}</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</div>
		);
	}
}

export default InfoPanel;
