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
	updateInventoriesHbStatus
} from '../../../actions/apps/headerBidding/hbActions';

import { showNotification, hideNotification } from '../../../actions/uiActions';

const HeaderBiddingContainer = props => <HeaderBidding {...props} />;

export default connect(
	state => {
		const { inventoryFound, bidders, setupStatus, inventories } = state.apps.headerBidding;

		return { inventoryFound, bidders, setupStatus, inventories };
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
		hideNotification
	}
)(HeaderBiddingContainer);
