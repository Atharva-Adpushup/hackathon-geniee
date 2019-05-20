/* eslint-disable import/prefer-default-export */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS
} from '../../../constants/headerBidding';
import * as service from '../../../services/hbService';

export const checkInventoryAction = siteId => dispatch => {
	service
		.checkInventory(siteId)
		.then(() => dispatch({ type: CHECK_INVENTORY, inventoryFound: true }))
		.catch(() => {
			dispatch({ type: CHECK_INVENTORY, inventoryFound: false });
		});
};

export const fetchAllBiddersAction = siteId => dispatch => {
	service
		.fetchBiddersList(siteId)
		.then(({ data: bidders }) => dispatch({ type: FETCH_ALL_BIDDERS, bidders }))
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});
};

export const getSetupStatusAction = siteId => dispatch => {
	service
		.getSetupStatus(siteId)
		.then(({ data: setupStatus }) => dispatch({ type: GET_SETUP_STATUS, setupStatus }))
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});
};
