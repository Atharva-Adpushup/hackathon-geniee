import { NETWORK_WIDE_RULES_ACTIONS } from '../../constants/global';

const networkWideRules = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case NETWORK_WIDE_RULES_ACTIONS.FETCH_NETWORK_WIDE_RULES:
			return { fetched: true, data: action.data };

		case NETWORK_WIDE_RULES_ACTIONS.UPDATE_NETWORK_WIDE_RULES:
			return { ...state, data: action.rules };

		default:
			return state;
	}
};

export default networkWideRules;
