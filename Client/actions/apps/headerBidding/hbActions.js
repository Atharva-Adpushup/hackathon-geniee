/* eslint-disable import/prefer-default-export */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS,
	ADD_BIDDER,
	UPDATE_BIDDER
} from '../../../constants/headerBidding';
import * as service from '../../../services/hbService';

export const checkInventoryAction = siteId => dispatch =>
	service
		.checkInventory(siteId)
		.then(() => dispatch({ type: CHECK_INVENTORY, inventoryFound: true }))
		.catch(() => {
			dispatch({ type: CHECK_INVENTORY, inventoryFound: false });
		});

export const fetchAllBiddersAction = siteId => dispatch =>
	service
		.fetchBiddersList(siteId)
		.then(({ data: bidders }) => dispatch({ type: FETCH_ALL_BIDDERS, bidders }))
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});

export const getSetupStatusAction = siteId => dispatch =>
	service
		.getSetupStatus(siteId)
		.then(({ data: setupStatus }) => dispatch({ type: GET_SETUP_STATUS, setupStatus }))
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});

export const addBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.addBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) =>
			// Save bidder config in store
			dispatch({ type: ADD_BIDDER, bidderKey, bidderConfig: bidderConfigFromDB })
		)
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});

export const updateBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.updateBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) =>
			// Save bidder config in store
			dispatch({ type: UPDATE_BIDDER, bidderKey, bidderConfig: bidderConfigFromDB })
		)
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
		});
