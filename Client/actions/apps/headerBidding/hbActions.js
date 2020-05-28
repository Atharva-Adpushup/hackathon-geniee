/* eslint-disable import/prefer-default-export */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	ADD_BIDDER,
	UPDATE_BIDDER,
	DELETE_BIDDER,
	FETCH_INVENTORIES,
	UPDATE_INVENTORIES_HB_STATUS,
	SET_DFP_SETUP_STATUS,
	UPDATE_ADSERVER_SETUP_STATUS,
	GET_HB_INIT_DATA,
	SET_UNSAVED_CHANGES
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

export const fetchHBInitDataAction = siteId => dispatch =>
	service
		.getHBInitData(siteId)
		.then(({ data: { setupStatus, bidders, inventories } }) =>
			dispatch({ type: GET_HB_INIT_DATA, siteId, setupStatus, bidders, inventories })
		)
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);
			history.push('/error');
		});
export const fetchAllBiddersAction = siteId => dispatch =>
	service
		.fetchBiddersList(siteId)
		.then(({ data: bidders }) => dispatch({ type: FETCH_ALL_BIDDERS, siteId, bidders }))
		.catch(() => {
			history.push('/error');
		});

export const setDfpSetupStatusAction = siteId => dispatch => {
	dispatch({ type: SET_DFP_SETUP_STATUS, siteId });
	dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: true });
};

export const addBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.addBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) => {
			dispatch({ type: ADD_BIDDER, siteId, bidderKey, bidderConfig: bidderConfigFromDB });
			dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: true });
		});

export const updateBidderAction = (siteId, bidderConfig, params) => dispatch =>
	service
		.updateBidder(siteId, bidderConfig, params)
		.then(({ data: { bidderConfig: bidderConfigFromDB, bidderKey } }) => {
			dispatch({ type: UPDATE_BIDDER, siteId, bidderKey, bidderConfig: bidderConfigFromDB });
			dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: true });
		});

export const deleteBidderAction = (siteId, bidderKey) => dispatch =>
	service.removeBidder(siteId, bidderKey).then(() => {
		dispatch({ type: DELETE_BIDDER, siteId, bidderKey });
		dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: true });
	});

export const fetchInventoriesAction = siteId => dispatch =>
	service
		.fetchInventories(siteId)
		.then(({ data: inventories }) => dispatch({ type: FETCH_INVENTORIES, siteId, inventories }))
		.catch(() => {
			history.push('/error');
		});

export const updateInventoriesHbStatus = (siteId, inventoriesToUpdate) => dispatch =>
	service.updateInventoriesHbStatus(siteId, inventoriesToUpdate).then(() => {
		dispatch({ type: UPDATE_INVENTORIES_HB_STATUS, siteId, inventoriesToUpdate });
		dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: true });
	});

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

export const setUnsavedChangesAction = hasUnsavedChanges => dispatch =>
	dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges });

export const masterSaveAction = siteId => dispatch =>
	service
		.startCdnSync(siteId)
		.then(() => dispatch({ type: SET_UNSAVED_CHANGES, hasUnsavedChanges: false }));
