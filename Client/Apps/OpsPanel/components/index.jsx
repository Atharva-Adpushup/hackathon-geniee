import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';

import { OP_NAV_ITEMS, OP_NAV_ITEMS_INDEXES, OP_NAV_ITEMS_VALUES } from '../configs/commonConsts';
import ActionCard from '../../../Components/ActionCard';

class OpsPanel extends Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	handleNavSelect = value => {
		const computedRedirectUrl = `/ops-panel`;
		let redirectUrl = '';

		switch (Number(value)) {
			default:
			case 1:
				redirectUrl = `${computedRedirectUrl}/settings`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/info-panel`;
				break;

			case 3:
				redirectUrl = `${computedRedirectUrl}/sites-mapping`;
				break;

			case 4:
				redirectUrl = `${computedRedirectUrl}/tools`;
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case OP_NAV_ITEMS_INDEXES.SETTINGS:
				return 'Settings';
			case OP_NAV_ITEMS_INDEXES.INFO_PANEL:
				return 'Info Panel';
			case OP_NAV_ITEMS_INDEXES.SITES_MAPPING:
				return 'Sites mapping';
			case OP_NAV_ITEMS_INDEXES.LIVE_SITES_MAPPING:
				return 'Live Sites Mapping';
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = OP_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}
		return (
			<ActionCard>
				<React.Fragment>
					<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
						<NavItem eventKey={1}>{OP_NAV_ITEMS_VALUES.SETTINGS}</NavItem>
						<NavItem eventKey={2}>{OP_NAV_ITEMS_VALUES.INFO_PANEL}</NavItem>
						<NavItem eventKey={3}>{OP_NAV_ITEMS_VALUES.SITES_MAPPING}</NavItem>
						<NavItem eventKey={4}>{OP_NAV_ITEMS_VALUES.TOOLS}</NavItem>
					</Nav>
					{this.renderContent()}
				</React.Fragment>
			</ActionCard>
		);
	}
}

export default OpsPanel;
