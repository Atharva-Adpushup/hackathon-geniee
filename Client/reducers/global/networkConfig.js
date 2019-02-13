import { NETWORK_CONFIG_ACTIONS } from '../../constants/global';

const networkConfig = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case NETWORK_CONFIG_ACTIONS.REPLACE_NETWORK_CONFIG:
			return { fetched: true, data: action.data };
		default:
			return state;
	}
};

export default networkConfig;
