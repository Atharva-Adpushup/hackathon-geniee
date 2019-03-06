import { SITE_ACTIONS } from '../../constants/global';

const sites = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case SITE_ACTIONS.REPLACE_SITE_DATA:
			return { fetched: true, data: action.data };

		case SITE_ACTIONS.UPDATE_SITE_DATA:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...action.data,
						...state.data[action.data.siteId]
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_STEP:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						...action.data
					}
				}
			};

		default:
			return state;
	}
};

export default sites;
