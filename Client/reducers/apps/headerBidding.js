/* eslint-disable consistent-return */
/* eslint-disable default-case */
import {
	CHECK_INVENTORY,
	FETCH_ALL_BIDDERS,
	GET_SETUP_STATUS
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
		default:
			return state;
	}
}
