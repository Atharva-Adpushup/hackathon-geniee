/* eslint-disable consistent-return */
/* eslint-disable default-case */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS,
	ADD_BIDDER,
	UPDATE_BIDDER,
	FETCH_INVENTORIES,
	UPDATE_INVENTORIES_HB_STATUS,
	SET_DFP_SETUP_STATUS
} from '../../constants/headerBidding';

const defaultState = {};

export default function(state = defaultState, action) {
	switch (action.type) {
		case CHECK_INVENTORY: {
			const { siteId, inventoryFound } = action;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					inventoryFound
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
		case GET_SETUP_STATUS: {
			const { siteId, setupStatus } = action;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					setupStatus
				}
			};
		}
		case SET_DFP_SETUP_STATUS: {
			const { siteId } = action;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					setupStatus: { ...state[siteId].setupStatus, dfpConnected: true }
				}
			};
		}
		case ADD_BIDDER: {
			const { siteId, bidderKey, bidderConfig } = action;
			const bidders = { ...state[siteId].bidders };

			delete bidders.notAddedBidders[bidderKey];
			if (!bidders.addedBidders) bidders.addedBidders = {};
			bidders.addedBidders[bidderKey] = bidderConfig;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					bidders,
					setupStatus: { ...state[siteId].setupStatus, biddersFound: true }
				}
			};
		}
		case UPDATE_BIDDER: {
			const { siteId, bidderKey, bidderConfig } = action;
			const bidders = { ...state[siteId].bidders };

			bidders.addedBidders[bidderKey] = bidderConfig;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					bidders
				}
			};
		}
		case FETCH_INVENTORIES: {
			const { siteId, inventories } = action;

			return {
				...state,
				[siteId]: {
					...state[siteId],
					inventories
				}
			};
		}
		case UPDATE_INVENTORIES_HB_STATUS: {
			const { siteId, inventoriesToUpdate } = action;
			const inventories = [...state[siteId].inventories];

			inventories.map(inventory => {
				const index = inventoriesToUpdate.findIndex(obj => obj.tempId === inventory.tempId);

				if (index > -1) {
					// eslint-disable-next-line no-param-reassign
					inventory.headerBidding = inventoriesToUpdate[index].headerBidding;
				}

				return inventory;
			});

			return {
				...state,
				[siteId]: {
					...state[siteId],
					inventories
				}
			};
		}
		default:
			return state;
	}
}
