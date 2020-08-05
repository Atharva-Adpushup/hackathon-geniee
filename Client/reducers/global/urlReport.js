import { URL_REPORTS_ACTIONS } from '../../constants/global';

const DEFAULT_HB_ANALYTICS_STATE = { fetched: false, data: {} };
const DEFAULT_STATE = {
	global: { ...DEFAULT_HB_ANALYTICS_STATE },
	account: { ...DEFAULT_HB_ANALYTICS_STATE }
};

const urlreports = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case URL_REPORTS_ACTIONS.REPLACE_GLOBAL_URL_REPORTS_DATA:
			return { ...state, global: { fetched: true, data: action.data } };

		default:
			return state;
	}
};

export default urlreports;
