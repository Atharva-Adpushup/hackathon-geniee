/* eslint-disable consistent-return */
/* eslint-disable default-case */
import { CHECK_INVENTORY } from '../../constants/headerBidding';

export default function(state = { inventoryFound: null }, action) {
	switch (action.type) {
		case CHECK_INVENTORY: {
			const { inventoryFound } = action;

			return {
				...state,
				inventoryFound
			};
		}
		default:
			return state;
	}
}
