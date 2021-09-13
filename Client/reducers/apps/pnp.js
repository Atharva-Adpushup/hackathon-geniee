import { UPDATE_PNP_CONFIG, UPDATE_PNP_CONFIG_KEY } from '../../constants/pnp';

const DEFAULT_STATE = {};

const pnpReducer = (state = DEFAULT_STATE, action) => {
	const { type, siteId, payload } = action;
	switch (type) {
		case UPDATE_PNP_CONFIG:
			return {
				...state,
				[siteId]: {
					...payload
				}
			};
		case UPDATE_PNP_CONFIG_KEY:
			return {
				...state,
				[siteId]: {
					...state[siteId],
					[payload.key]: payload.value
				}
			};
		default:
			return state;
	}
};

export default pnpReducer;