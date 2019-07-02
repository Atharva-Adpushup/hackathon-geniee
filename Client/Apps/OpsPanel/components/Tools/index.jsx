import React, { Component } from 'react';
import { Tab, Nav, NavItem, Row, Col } from 'react-bootstrap';
import { TOOLS_IDENTIFIERS } from '../../configs/commonConsts';
import RegexVerification from './RegexVerification/index';
import EnableHbBidder from './EnableHbBidder';
import BackupAds from './BackupAds/index';

class Tools extends Component {
	state = {
		activeKey: TOOLS_IDENTIFIERS.BACKUP_ADS
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	renderContent = () => {
		const { activeKey } = this.state;
		const { networkConfig, sites, showNotification, updateNetworkConfig } = this.props;

		switch (activeKey) {
			default:
			case TOOLS_IDENTIFIERS.BACKUP_ADS:
				return <BackupAds showNotification={showNotification} sites={sites} />;
			case TOOLS_IDENTIFIERS.ENABLE_HB_BIDDER:
				return (
					<EnableHbBidder networkConfig={networkConfig} updateNetworkConfig={updateNetworkConfig} />
				);
			case TOOLS_IDENTIFIERS.REGEX_VERIFICATION:
				return <RegexVerification sites={sites} showNotification={showNotification} />;
			case TOOLS_IDENTIFIERS.REGEX_GENERATION:
				return 'Regex Generation';
		}
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
								<NavItem eventKey={TOOLS_IDENTIFIERS.BACKUP_ADS}>Backup Ads</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.ENABLE_HB_BIDDER}>Enable HB Bidder</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.REGEX_VERIFICATION}>
									Regex Verification
								</NavItem>
								<NavItem eventKey={TOOLS_IDENTIFIERS.REGEX_GENERATION}>Regex Generation</NavItem>
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

export default Tools;
