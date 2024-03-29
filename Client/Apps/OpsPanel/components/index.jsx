import React, { Component } from 'react';
import { Nav, NavItem } from '@/Client/helpers/react-bootstrap-imports';

import { OP_NAV_ITEMS, OP_NAV_ITEMS_INDEXES, OP_NAV_ITEMS_VALUES } from '../configs/commonConsts';
import ActionCard from '../../../Components/ActionCard';
import Settings from './Settings/index';
import ToolsContainer from '../containers/ToolsContainer';
import InfoPanelContainer from '../containers/InfoPanelContainer';
import SiteMappingContainer from '../containers/SiteMappingContainer';
import history from '../../../helpers/history';

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
		const computedRedirectUrl = `/admin-panel`;
		let redirectUrl = '';

		switch (Number(value)) {
			default:
			case 1:
				redirectUrl = `${computedRedirectUrl}/settings-account`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/settings-sites`;
				break;

			case 3:
				redirectUrl = `${computedRedirectUrl}/info-panel`;
				break;

			case 4:
				redirectUrl = `${computedRedirectUrl}/sites-mapping`;
				break;

			case 5:
				redirectUrl = `${computedRedirectUrl}/tools`;
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		switch (activeTab) {
			default:
			case OP_NAV_ITEMS_INDEXES.ACCOUNT_SETTINGS:
				return <Settings activeKey="account" {...this.props} />;
			case OP_NAV_ITEMS_INDEXES.SITE_SETTINGS:
				return <Settings activeKey="sites" {...this.props} />;
			case OP_NAV_ITEMS_INDEXES.INFO_PANEL:
				return <InfoPanelContainer {...this.props} />;
			case OP_NAV_ITEMS_INDEXES.SITES_MAPPING:
				return <SiteMappingContainer {...this.props} />;
			case OP_NAV_ITEMS_INDEXES.TOOLS:
				return <ToolsContainer {...this.props} />;
		}
	}

	render() {
		const { redirectUrl } = this.state;
		const activeTab = this.getActiveTab();
		const activeItem = OP_NAV_ITEMS[activeTab];

		if (redirectUrl) {
			history.push(redirectUrl);
			return null;
		}
		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{OP_NAV_ITEMS_VALUES.ACCOUNT_SETTINGS}</NavItem>
					<NavItem eventKey={2}>{OP_NAV_ITEMS_VALUES.SITE_SETTINGS}</NavItem>
					<NavItem eventKey={3}>{OP_NAV_ITEMS_VALUES.INFO_PANEL}</NavItem>
					<NavItem eventKey={5}>{OP_NAV_ITEMS_VALUES.TOOLS}</NavItem>
					<NavItem eventKey={4}>{OP_NAV_ITEMS_VALUES.SITES_MAPPING}</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default OpsPanel;
