import React from 'react';
import { connect } from 'react-redux';
import HeaderBidding from '../components/HeaderBidding';
import {
	checkInventoryAction,
	fetchAllBiddersAction,
	addBidderAction,
	updateBidderAction,
	deleteBidderAction,
	fetchInventoriesAction,
	updateInventoriesHbStatus,
	setDfpSetupStatusAction,
	checkOrBeginDfpSetupAction,
	fetchHBInitDataAction,
	setUnsavedChangesAction,
	masterSaveAction,
	fetchHBRulesAction,
	saveHBRulesAction
} from '../../../actions/apps/headerBidding/hbActions';

import { showNotification, hideNotification } from '../../../actions/uiActions';

const HeaderBiddingContainer = props => {
	const { currSiteHbData, hasUnsavedChanges, ...rest } = props;
	const finalCurrSiteHbData = {
		inventoryFound: null,
		bidders: null,
		setupStatus: null,
		inventories: null,
		...currSiteHbData
	};
	const { inventoryFound, bidders, setupStatus, inventories, rules = [] } = finalCurrSiteHbData;

	return (
		<HeaderBidding
			inventoryFound={inventoryFound}
			inventories={inventories}
			bidders={bidders}
			setupStatus={setupStatus}
			rules={rules}
			hasUnsavedChanges={hasUnsavedChanges}
			{...rest}
		/>
	);
};

export default connect(
	(state, ownProps) => {
		const {
			match: {
				params: { siteId }
			}
		} = ownProps;
		const { user } = state.global;
		const {
			apps: {
				headerBidding: { hasUnsavedChanges, sites }
			},
			global: {
				user: {
					data: {
						sites: {
							[siteId]: { domain }
						},
						isSuperUser
					}
				}
			}
		} = state;
		const currSiteHbData = sites && sites[siteId];
		return { currSiteHbData, domain, hasUnsavedChanges, user: user.data, isSuperUser };
	},
	{
		checkInventoryAction,
		fetchAllBiddersAction,
		addBidderAction,
		updateBidderAction,
		deleteBidderAction,
		fetchInventoriesAction,
		updateInventoriesHbStatus,
		showNotification,
		hideNotification,
		setDfpSetupStatusAction,
		checkOrBeginDfpSetupAction,
		fetchHBInitDataAction,
		setUnsavedChangesAction,
		masterSaveAction,
		fetchHBRulesAction,
		saveHBRulesAction
	}
)(HeaderBiddingContainer);
