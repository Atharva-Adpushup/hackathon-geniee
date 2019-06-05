/* eslint-disable consistent-return */
/* eslint-disable default-case */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS,
	ADD_BIDDER,
	UPDATE_BIDDER,
	FETCH_INVENTORIES
} from '../../constants/headerBidding';

const defaultState = { inventoryFound: null, bidders: null, setupStatus: null };

export default function(state = defaultState, action) {
	switch (action.type) {
		case CHECK_INVENTORY: {
			const { inventoryFound } = action;

			return {
				...state,
				inventoryFound
			};
		}
		case FETCH_ALL_BIDDERS: {
			const { bidders } = action;

			return {
				...state,
				bidders
			};
		}
		case GET_SETUP_STATUS: {
			const { setupStatus } = action;

			return {
				...state,
				setupStatus
			};
		}
		case ADD_BIDDER: {
			const { bidderKey, bidderConfig } = action;
			const bidders = { ...state.bidders };

			delete bidders.notAddedBidders[bidderKey];
			if (!bidders.addedBidders) bidders.addedBidders = {};
			bidders.addedBidders[bidderKey] = bidderConfig;

			return {
				...state,
				bidders
			};
		}
		case UPDATE_BIDDER: {
			const { bidderKey, bidderConfig } = action;
			const bidders = { ...state.bidders };

			bidders.addedBidders[bidderKey] = bidderConfig;

			return {
				...state,
				bidders
			};
		}
		case FETCH_INVENTORIES: {
			const { inventories } = action;

			return {
				...state,
				inventories
			};
		}
		default:
			return state;
	}
}
