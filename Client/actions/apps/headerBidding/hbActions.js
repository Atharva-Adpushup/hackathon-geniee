/* eslint-disable import/prefer-default-export */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS,
	ADD_BIDDER,
	UPDATE_BIDDER,
	FETCH_INVENTORIES,
	UPDATE_INVENTORIES_HB_STATUS,
	SET_DFP_SETUP_STATUS,
	UPDATE_ADSERVER_SETUP_STATUS
} from '../../../constants/headerBidding';
import history from '../../../helpers/history';
import * as service from '../../../services/hbService';

export const checkInventoryAction = siteId => dispatch =>
	service
		.checkInventory(siteId)
		.then(() => dispatch({ type: CHECK_INVENTORY, siteId, inventoryFound: true }))
		.catch(() => {
			dispatch({ type: CHECK_INVENTORY, siteId, inventoryFound: false });
		});

export const fetchAllBiddersAction = siteId => dispatch =>
	service
		.fetchBiddersList(siteId)
		.then(({ data: bidders }) => dispatch({ type: FETCH_ALL_BIDDERS, siteId, bidders }))
		.catch(() => {
			history.push('/error');
		});

export const getSetupStatusAction = siteId => dispatch =>
	service
		.getSetupStatus(siteId)
		.then(({ data: setupStatus }) => dispatch({ type: GET_SETUP_STATUS, siteId, setupStatus }))
		.catch(() => {
			history.push('/error');
		});

export const setDfpSetupStatusAction = siteId => dispatch =>
	dispatch({ type: SET_DFP_SETUP_STATUS, siteId });

export const addBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.addBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) =>
			// Save bidder config in store
			dispatch({ type: ADD_BIDDER, siteId, bidderKey, bidderConfig: bidderConfigFromDB })
		);

export const updateBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.updateBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) =>
			// Save bidder config in store
			dispatch({ type: UPDATE_BIDDER, siteId, bidderKey, bidderConfig: bidderConfigFromDB })
		);

export const fetchInventoriesAction = siteId => dispatch =>
	service
		.fetchInventories(siteId)
		.then(({ data: inventories }) =>
			// Save bidder config in store
			dispatch({ type: FETCH_INVENTORIES, siteId, inventories })
		)
		.catch(() => {
			history.push('/error');
		});

export const updateInventoriesHbStatus = (siteId, inventoriesToUpdate) => dispatch =>
	service
		.updateInventoriesHbStatus(siteId, inventoriesToUpdate)
		.then(() => dispatch({ type: UPDATE_INVENTORIES_HB_STATUS, siteId, inventoriesToUpdate }));

export const checkOrBeginDfpSetupAction = siteId => dispatch =>
	service
		.checkOrBeginDfpSetup()
		.then(response => {
			let adServerSetupStatus;
			switch (response.status) {
				case 202: {
					adServerSetupStatus = 1;
					break;
				}
				case 200: {
					adServerSetupStatus = 2;
					break;
				}
				default:
			}
			return dispatch({ type: UPDATE_ADSERVER_SETUP_STATUS, siteId, adServerSetupStatus });
		})
		.catch(err => {
			if (err.response && err.response.status === 502) {
				const adServerSetupStatus = 3;
				return dispatch({ type: UPDATE_ADSERVER_SETUP_STATUS, siteId, adServerSetupStatus });
			}

			return history.push('/error');
		});
