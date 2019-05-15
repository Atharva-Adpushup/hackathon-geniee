import React from 'react';
import { connect } from 'react-redux';
import HeaderBidding from '../components/HeaderBidding';
import { checkInventoryAction } from '../../../actions/apps/headerBidding/hbActions';

const HeaderBiddingContainer = props => <HeaderBidding {...props} />;

export default connect(
	state => ({ inventoryFound: state.apps.headerBidding.inventoryFound }),
	{ checkInventoryAction }
)(HeaderBiddingContainer);
