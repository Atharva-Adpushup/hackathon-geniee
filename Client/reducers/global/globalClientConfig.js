import { GLOBAL_APP_CONFIG_ACTIONS } from '../../constants/global';

const globalClientConfig = (state = { data: [] }, action) => {
	switch (action.type) {
		case GLOBAL_APP_CONFIG_ACTIONS.UPDATE_GLOBAL_APP_CONFIG:
			return {
				...state,
				data: { ...action.data }
			};

		default:
			return state;
	}
};

export default globalClientConfig;
