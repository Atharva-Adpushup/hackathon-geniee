import React from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import { NAV_ITEMS, NAV_ITEMS_INDEXES, NAV_ITEMS_VALUES } from '../constants';
import Setup from './Setup';

class HeaderBidding extends React.Component {
	state = {
		redirectUrl: ''
	};

	getActiveTab = () => {
		const {
			customProps: { activeTab }
		} = this.props;

		return activeTab;
	};

	getSiteId = () => {
		const {
			match: {
				params: { siteId }
			}
		} = this.props;

		return siteId;
	};

	handleNavSelect = value => {
		const siteId = this.getSiteId();
		const computedRedirectUrl = `/sites/${siteId}/apps/header-bidding`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/tab-2`;
				break;

			case 3:
				redirectUrl = `${computedRedirectUrl}/tab-3`;
				break;
			case 4:
				redirectUrl = `${computedRedirectUrl}/tab-4`;
				break;
			case 5:
				redirectUrl = `${computedRedirectUrl}/tab-5`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent() {
		const activeTab = this.getActiveTab();

		function getContent() {
			switch (activeTab) {
				case NAV_ITEMS_INDEXES.TAB_1:
					return <Setup />;
				case NAV_ITEMS_INDEXES.TAB_2:
					return 'Tab 2';
				case NAV_ITEMS_INDEXES.TAB_3:
					return 'Tab 3';
				case NAV_ITEMS_INDEXES.TAB_4:
					return 'Tab 4';
				case NAV_ITEMS_INDEXES.TAB_5:
					return 'Tab 5';
				default:
					return null;
			}
		}

		return <div className="u-padding-v5 u-padding-h5">{getContent()}</div>;
	}

	render() {
		const activeTab = this.getActiveTab();
		const activeItem = NAV_ITEMS[activeTab];
		const { redirectUrl } = this.state;

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					<NavItem eventKey={1}>{NAV_ITEMS_VALUES.TAB_1}</NavItem>
					<NavItem eventKey={2}>{NAV_ITEMS_VALUES.TAB_2}</NavItem>
					<NavItem eventKey={3}>{NAV_ITEMS_VALUES.TAB_3}</NavItem>
					<NavItem eventKey={4}>{NAV_ITEMS_VALUES.TAB_4}</NavItem>
					<NavItem eventKey={5}>{NAV_ITEMS_VALUES.TAB_5}</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	}
}

export default HeaderBidding;
