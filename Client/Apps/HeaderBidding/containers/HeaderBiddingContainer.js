import React from 'react';
import { connect } from 'react-redux';
import HeaderBidding from '../components/HeaderBidding';
import {
	checkInventoryAction,
	fetchAllBiddersAction,
	getSetupStatusAction,
	addBidderAction,
	updateBidderAction,
	fetchInventoriesAction,
	updateInventoriesHbStatus,
	setDfpSetupStatusAction,
	checkOrBeginDfpSetupAction
} from '../../../actions/apps/headerBidding/hbActions';

import { showNotification, hideNotification } from '../../../actions/uiActions';

const HeaderBiddingContainer = props => {
	const { currSiteHbData, ...rest } = props;
	const finalCurrSiteHbData = {
		inventoryFound: null,
		bidders: null,
		setupStatus: null,
		inventories: null,
		...currSiteHbData
	};
	const { inventoryFound, bidders, setupStatus, inventories } = finalCurrSiteHbData;

	return (
		<HeaderBidding
			inventoryFound={inventoryFound}
			inventories={inventories}
			bidders={bidders}
			setupStatus={setupStatus}
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
		// const { inventoryFound, bidders, setupStatus, inventories } = state.apps.headerBidding;
		const { [siteId]: currSiteHbData } = state.apps.headerBidding;
		const {
			[siteId]: { domain }
		} = state.global.user.data.sites;

		return { currSiteHbData, domain };
	},
	{
		checkInventoryAction,
		fetchAllBiddersAction,
		getSetupStatusAction,
		addBidderAction,
		updateBidderAction,
		fetchInventoriesAction,
		updateInventoriesHbStatus,
		showNotification,
		hideNotification,
		setDfpSetupStatusAction,
		checkOrBeginDfpSetupAction
	}
)(HeaderBiddingContainer);
