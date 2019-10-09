/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import { Redirect, Prompt } from 'react-router-dom';
import { Nav, NavItem } from 'react-bootstrap';
import { NAV_ITEMS, NAV_ITEMS_INDEXES, NAV_ITEMS_VALUES } from '../constants';
import Setup from './Setup';
import BiddersTab from './BiddersTab';
import InventoryTab from './InventoryTab';
import PrebidSettingsTab from './PrebidSettingsTab';
import OptimizationTab from './OptimizationTab';
import CustomButton from '../../../Components/CustomButton';
import config from '../../../config/config';

class HeaderBidding extends React.Component {
	state = {
		redirectUrl: '',
		isMasterSaving: false
	};

	componentDidMount() {
		const {
			fetchHBInitDataAction,
			match: {
				params: { siteId }
			}
		} = this.props;

		this.handleDefaultTabWrapper(null, true);

		fetchHBInitDataAction(siteId);

		window.addEventListener('beforeunload', this.handleTabClose);
	}

	componentDidUpdate(prevProps) {
		const { setupStatus: prevSetupStatus } = prevProps;
		this.handleDefaultTabWrapper(prevSetupStatus, false);
	}

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleTabClose);
	}

	handleTabClose = e => {
		e.preventDefault();

		const { hasUnsavedChanges } = this.props;

		if (hasUnsavedChanges) {
			// eslint-disable-next-line no-param-reassign
			e.returnValue = config.HB_MSGS.UNSAVED_CHANGES;
			return;
		}

		delete e.returnValue;
	};

	onMasterSave = () => {
		const {
			match: {
				params: { siteId }
			},
			masterSaveAction
		} = this.props;

		this.setState({ isMasterSaving: true });

		masterSaveAction(siteId)
			.then(() => {
				this.setState({ isMasterSaving: false });
			})
			.catch(() => {
				this.setState({ isMasterSaving: false });
			});
	};

	handleDefaultTabWrapper = (prevSetupStatus, isFirstLoad) => {
		const {
			match: {
				params: { siteId },
				url
			},
			setupStatus
		} = this.props;

		if (setupStatus && !isFirstLoad) {
			this.handleDefaultTab(url, siteId, prevSetupStatus);
		}
	};

	handleDefaultTab = (url, siteId, prevSetupStatus) => {
		const { setupStatus, showNotification } = this.props;
		const {
			isAdpushupDfp,
			dfpConnected,
			inventoryFound,
			biddersFound,
			adServerSetupStatus
		} = setupStatus;

		const isSetupAlreadyCompleted =
			!!prevSetupStatus &&
			(isAdpushupDfp ||
				(prevSetupStatus.dfpConnected && prevSetupStatus.adServerSetupStatus === 2)) &&
			prevSetupStatus.inventoryFound &&
			prevSetupStatus.biddersFound;

		const isSetupCompleted =
			(isAdpushupDfp || (dfpConnected && adServerSetupStatus === 2)) &&
			inventoryFound &&
			biddersFound;

		if (url === `/sites/${siteId}/apps/header-bidding` && isSetupCompleted) {
			this.setState(
				{
					redirectUrl: `/sites/${siteId}/apps/header-bidding/${NAV_ITEMS_INDEXES.TAB_2}`
				},
				() => {
					if (!!prevSetupStatus && !isSetupAlreadyCompleted) {
						showNotification({
							mode: 'success',
							title: 'Success',
							message: 'Setup completed successfully',
							autoDismiss: 5
						});
					}
				}
			);
		}
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

	// eslint-disable-next-line consistent-return
	handleNavSelect = value => {
		const {
			// eslint-disable-next-line no-unused-vars
			setupStatus: {
				isAdpushupDfp,
				dfpConnected,
				inventoryFound,
				biddersFound,
				adServerSetupStatus
			}
		} = this.props;
		const siteId = this.getSiteId();
		const computedRedirectUrl = `/sites/${siteId}/apps/header-bidding`;
		let redirectUrl = '';

		switch (Number(value)) {
			case 1:
				redirectUrl = `${computedRedirectUrl}`;
				break;

			case 2:
				redirectUrl = `${computedRedirectUrl}/${NAV_ITEMS_INDEXES.TAB_2}`;
				break;

			case 3:
				if ((!isAdpushupDfp && (!dfpConnected || adServerSetupStatus !== 2)) || !inventoryFound)
					return false;
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
			domain,
			checkInventoryAction,
			inventoryFound,
			bidders,
			fetchAllBiddersAction,
			setupStatus,
			setDfpSetupStatusAction,
			checkOrBeginDfpSetupAction,
			addBidderAction,
			updateBidderAction,
			inventories,
			updateInventoriesHbStatus,
			showNotification,
			setUnsavedChangesAction
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
							checkOrBeginDfpSetupAction={checkOrBeginDfpSetupAction}
							showNotification={showNotification}
						/>
					);
				case 'bidders':
					return (
						<BiddersTab
							siteId={siteId}
							domain={domain}
							bidders={bidders}
							fetchAllBiddersAction={fetchAllBiddersAction}
							addBidderAction={addBidderAction}
							updateBidderAction={updateBidderAction}
							showNotification={showNotification}
							inventories={inventories}
						/>
					);
				case 'inventory':
					return (
						<InventoryTab
							siteId={siteId}
							inventories={inventories}
							updateInventoriesHbStatus={updateInventoriesHbStatus}
							showNotification={showNotification}
							setUnsavedChangesAction={setUnsavedChangesAction}
						/>
					);
				case 'prebid-settings':
					return (
						<PrebidSettingsTab
							siteId={siteId}
							showNotification={showNotification}
							setUnsavedChangesAction={setUnsavedChangesAction}
						/>
					);
				case 'optimization':
					return (
						<OptimizationTab
							siteId={siteId}
							showNotification={showNotification}
							setUnsavedChangesAction={setUnsavedChangesAction}
						/>
					);
				default:
					return null;
			}
		}

		return getContent();
	};

	renderTabsLayout = () => {
		const activeTab = this.getActiveTab();
		const activeItem = NAV_ITEMS[activeTab];
		const {
			// eslint-disable-next-line no-unused-vars
			setupStatus: {
				isAdpushupDfp,
				dfpConnected,
				inventoryFound,
				biddersFound,
				adServerSetupStatus
			},
			hasUnsavedChanges
		} = this.props;
		const { isMasterSaving } = this.state;

		return (
			<div>
				<Nav bsStyle="tabs" activeKey={activeItem.INDEX} onSelect={this.handleNavSelect}>
					{((!isAdpushupDfp && (!dfpConnected || adServerSetupStatus !== 2)) ||
						!inventoryFound ||
						!biddersFound) && <NavItem eventKey={1}>{NAV_ITEMS_VALUES.TAB_1}</NavItem>}
					<NavItem eventKey={2}>{NAV_ITEMS_VALUES.TAB_2}</NavItem>
					<NavItem
						eventKey={3}
						className={
							(!isAdpushupDfp && (!dfpConnected || adServerSetupStatus !== 2)) || !inventoryFound
								? 'disabled'
								: ''
						}
					>
						{NAV_ITEMS_VALUES.TAB_3}
					</NavItem>
					<NavItem eventKey={4} className={!biddersFound ? 'disabled' : ''}>
						{NAV_ITEMS_VALUES.TAB_4}
					</NavItem>
					<NavItem eventKey={5} className={!biddersFound ? 'disabled' : ''}>
						{NAV_ITEMS_VALUES.TAB_5}
					</NavItem>

					<CustomButton
						type="button"
						variant="primary"
						className="pull-right"
						showSpinner={isMasterSaving}
						disabled={!hasUnsavedChanges}
						onClick={this.onMasterSave}
					>
						Master Save
					</CustomButton>
					<Prompt when={hasUnsavedChanges} message={config.HB_MSGS.UNSAVED_CHANGES} />
				</Nav>
				{this.renderContent()}
			</div>
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
