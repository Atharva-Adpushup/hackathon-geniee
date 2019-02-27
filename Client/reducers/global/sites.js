import { SITE_ACTIONS } from '../../constants/global';

const sites = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case SITE_ACTIONS.REPLACE_SITE_DATA:
			return { fetched: true, data: action.data };
		default:
			return state;
	}
};

export default sites;
