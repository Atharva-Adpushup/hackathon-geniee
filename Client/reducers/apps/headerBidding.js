/* eslint-disable consistent-return */
/* eslint-disable default-case */
import {
	CHECK_INVENTORY,
	ADD_BIDDER,
	UPDATE_BIDDER,
	DELETE_BIDDER,
	FETCH_INVENTORIES,
	UPDATE_INVENTORIES_HB_STATUS,
	SET_DFP_SETUP_STATUS,
	UPDATE_ADSERVER_SETUP_STATUS,
	GET_HB_INIT_DATA,
	FETCH_ALL_BIDDERS,
	SET_UNSAVED_CHANGES,
	FETCH_HB_RULES,
	UPDATE_HB_RULES
} from '../../constants/headerBidding';

const defaultState = { hasUnsavedChanges: false, sites: {} };

export default function(state = defaultState, action) {
	switch (action.type) {
		case CHECK_INVENTORY: {
			const { siteId, inventoryFound } = action;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						inventoryFound
					}
				}
			};
		}
		case FETCH_ALL_BIDDERS: {
			const { siteId, bidders } = action;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					bidders
				}
			};
		}
		case SET_DFP_SETUP_STATUS: {
			const { siteId } = action;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						setupStatus: { ...state.sites[siteId].setupStatus, dfpConnected: true }
					}
				}
			};
		}
		case ADD_BIDDER: {
			const { siteId, bidderKey, bidderConfig } = action;
			const bidders = { ...state.sites[siteId].bidders };

			if (!bidders.addedBidders) bidders.addedBidders = {};
			bidders.addedBidders[bidderKey] = {
				...bidders.notAddedBidders[bidderKey],
				...bidderConfig
			};

			delete bidders.notAddedBidders[bidderKey];

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						bidders,
						setupStatus: { ...state.sites[siteId].setupStatus, biddersFound: true }
					}
				}
			};
		}
		case UPDATE_BIDDER: {
			const { siteId, bidderKey, bidderConfig } = action;
			const bidders = { ...state.sites[siteId].bidders };

			bidders.addedBidders[bidderKey] = {
				...bidders.addedBidders[bidderKey],
				...bidderConfig
			};

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						bidders
					}
				}
			};
		}
		case DELETE_BIDDER: {
			const { siteId, bidderKey } = action;
			const bidders = { ...state.sites[siteId].bidders };

			const bidderToRemove = bidders.addedBidders[bidderKey];
			delete bidders.addedBidders[bidderKey];
			bidders.notAddedBidders[bidderKey] = bidderToRemove;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						bidders
					}
				}
			};
		}
		case FETCH_INVENTORIES: {
			const { siteId, inventories } = action;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						inventories
					}
				}
			};
		}
		case UPDATE_INVENTORIES_HB_STATUS: {
			const { siteId, inventoriesToUpdate } = action;
			const inventories = [...state.sites[siteId].inventories];

			inventories.map(inventory => {
				const index = inventoriesToUpdate.findIndex(obj => obj.adUnitId === inventory.adUnitId);

				if (index > -1) {
					// eslint-disable-next-line no-param-reassign
					inventory.headerBidding = inventoriesToUpdate[index].headerBidding;
				}

				return inventory;
			});

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						inventories
					}
				}
			};
		}
		case UPDATE_ADSERVER_SETUP_STATUS: {
			const { siteId, adServerSetupStatus } = action;
			const prevAdServerSetupStatus =
				state[siteId] && state[siteId].setupStatus && state[siteId].setupStatus.adServerSetupStatus;

			if (prevAdServerSetupStatus === false || prevAdServerSetupStatus === adServerSetupStatus)
				return state;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					setupStatus: { ...state[siteId].setupStatus, adServerSetupStatus }
				}
			};
		}
		case GET_HB_INIT_DATA: {
			const { siteId, setupStatus, bidders, inventories } = action;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						setupStatus,
						bidders,
						inventories
					}
				}
			};
		}
		case SET_UNSAVED_CHANGES: {
			const { hasUnsavedChanges } = action;
			if (hasUnsavedChanges === state.hasUnsavedChanges) return state;

			return {
				...state,
				hasUnsavedChanges
			};
		}

		case FETCH_HB_RULES:
		case UPDATE_HB_RULES: {
			const { siteId, rules } = action;

			return {
				...state,
				sites: {
					...state.sites,
					[siteId]: {
						...state.sites[siteId],
						rules
					}
				}
			};
		}

		default:
			return state;
	}
}
