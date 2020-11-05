import { URL_REPORTS_ACTIONS } from '../../constants/global';

const DEFAULT_URL_UTM_REPORT_STATE = { fetched: false, data: {} };
const DEFAULT_STATE = {
	global: { ...DEFAULT_URL_UTM_REPORT_STATE },
	account: { ...DEFAULT_URL_UTM_REPORT_STATE }
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
