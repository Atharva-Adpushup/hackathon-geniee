import React from 'react';
import { connect } from 'react-redux';
import HeaderBidding from '../components/HeaderBidding';
import {
	checkInventoryAction,
	fetchAllBiddersAction,
	getSetupStatusAction,
	addBidderAction,
	updateBidderAction
} from '../../../actions/apps/headerBidding/hbActions';

const HeaderBiddingContainer = props => <HeaderBidding {...props} />;

export default connect(
	state => {
		const { inventoryFound, bidders, setupStatus } = state.apps.headerBidding;

		return { inventoryFound, bidders, setupStatus };
	},
	{
		checkInventoryAction,
		fetchAllBiddersAction,
		getSetupStatusAction,
		addBidderAction,
		updateBidderAction
	}
)(HeaderBiddingContainer);
