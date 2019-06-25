/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
import ActionCard from '../../../Components/ActionCard/index';
import { NAV_ITEMS, NAV_ITEMS_INDEXES, NAV_ITEMS_VALUES } from '../constants';
import Setup from './Setup';
import BiddersTab from './BiddersTab';
import InventoryTab from './InventoryTab';
import PrebidSettingsTab from './PrebidSettingsTab';
import OptimizationTab from './OptimizationTab';

class HeaderBidding extends React.Component {
	state = {
		redirectUrl: ''
	};

	componentDidMount() {
		const {
			match: {
				params: { siteId },
				url
			},
			getSetupStatusAction
		} = this.props;

		getSetupStatusAction(siteId).then(() => {
			const {
				setupStatus: { inventoryFound, biddersFound }
			} = this.props;

			if (url === `/sites/${siteId}/apps/header-bidding` && inventoryFound && biddersFound) {
				this.setState({
					redirectUrl: `/sites/${siteId}/apps/header-bidding/${NAV_ITEMS_INDEXES.TAB_2}`
				});
			}
		});
	}

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

	// eslint-disable-next-line consistent-return
	handleNavSelect = value => {
		const {
			// eslint-disable-next-line no-unused-vars
			setupStatus: { dfpConnected, adServerSetupCompleted, inventoryFound, biddersFound }
		} = this.props;
		const siteId = this.getSiteId();
		const computedRedirectUrl = `/sites/${siteId}/apps/header-bidding`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				if (!adServerSetupCompleted) return false;
				redirectUrl = `${computedRedirectUrl}/${NAV_ITEMS_INDEXES.TAB_2}`;
				break;

			case 3:
				if (!adServerSetupCompleted || !inventoryFound) return false;
				redirectUrl = `${computedRedirectUrl}/${NAV_ITEMS_INDEXES.TAB_3}`;
				break;
			case 4:
				if (!biddersFound) return false;
				redirectUrl = `${computedRedirectUrl}/${NAV_ITEMS_INDEXES.TAB_4}`;
				break;
			case 5:
				if (!biddersFound) return false;
				redirectUrl = `${computedRedirectUrl}/${NAV_ITEMS_INDEXES.TAB_5}`;
				break;

			default:
				break;
		}

		this.setState({ redirectUrl });
	};

	renderContent = () => {
		const {
			match: {
				params: { siteId }
			},
			checkInventoryAction,
			inventoryFound,
			bidders,
			fetchAllBiddersAction,
			setupStatus,
			setDfpSetupStatusAction,
			addBidderAction,
			updateBidderAction,
			inventories,
			fetchInventoriesAction,
			updateInventoriesHbStatus,
			showNotification
		} = this.props;

		const activeTab = this.getActiveTab();

		function getContent() {
			switch (activeTab) {
				case 'setup':
					return (
						<Setup
							siteId={siteId}
							checkInventoryAction={checkInventoryAction}
							inventoryFound={inventoryFound}
							setupStatus={setupStatus}
							setDfpSetupStatusAction={setDfpSetupStatusAction}
						/>
					);
				case 'bidders':
					return (
						<BiddersTab
							siteId={siteId}
							bidders={bidders}
							fetchAllBiddersAction={fetchAllBiddersAction}
							addBidderAction={addBidderAction}
							updateBidderAction={updateBidderAction}
							showNotification={showNotification}
						/>
					);
				case 'inventory':
					return (
						<InventoryTab
							siteId={siteId}
							inventories={inventories}
							fetchInventoriesAction={fetchInventoriesAction}
							updateInventoriesHbStatus={updateInventoriesHbStatus}
						/>
					);
				case 'prebid-settings':
					return <PrebidSettingsTab siteId={siteId} showNotification={showNotification} />;
				case 'optimization':
					return <OptimizationTab siteId={siteId} />;
				default:
					return null;
			}
		}

		return <div className="u-padding-v5 u-padding-h5">{getContent()}</div>;
	};

	renderTabsLayout = () => {
		const activeTab = this.getActiveTab();
		const activeItem = NAV_ITEMS[activeTab];
		const {
			// eslint-disable-next-line no-unused-vars
			setupStatus: { dfpConnected, adServerSetupCompleted, inventoryFound, biddersFound }
		} = this.props;

		return (
			<ActionCard>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					{(!inventoryFound || !biddersFound) && (
						<NavItem eventKey={1}>{NAV_ITEMS_VALUES.TAB_1}</NavItem>
					)}
					<NavItem
						eventKey={2}
						// eslint-disable-next-line no-constant-condition
						className={!adServerSetupCompleted ? 'disabled' : ''}
					>
						{NAV_ITEMS_VALUES.TAB_2}
					</NavItem>
					<NavItem
						eventKey={3}
						className={!adServerSetupCompleted || !inventoryFound ? 'disabled' : ''}
					>
						{NAV_ITEMS_VALUES.TAB_3}
					</NavItem>
					<NavItem eventKey={4} className={!biddersFound ? 'disabled' : ''}>
						{NAV_ITEMS_VALUES.TAB_4}
					</NavItem>
					<NavItem eventKey={5} className={!biddersFound ? 'disabled' : ''}>
						{NAV_ITEMS_VALUES.TAB_5}
					</NavItem>
				</Nav>
				{this.renderContent()}
			</ActionCard>
		);
	};

	render() {
		const { redirectUrl } = this.state;
		const { setupStatus } = this.props;

		if (redirectUrl) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		return setupStatus && this.renderTabsLayout();
	}
}

export default HeaderBidding;
