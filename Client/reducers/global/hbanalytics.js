import { HB_ANALYTICS_ACTIONS } from '../../constants/global';

const DEFAULT_HB_ANALYTICS_STATE = { fetched: false, data: {} };
const DEFAULT_STATE = {
	global: { ...DEFAULT_HB_ANALYTICS_STATE },
	account: { ...DEFAULT_HB_ANALYTICS_STATE }
};

const hbAnalytics = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case HB_ANALYTICS_ACTIONS.REPLACE_GLOBAL_HB_ANALYTIC_DATA:
			return { ...state, global: { fetched: true, data: action.data } };

		// case HB_ANALYTICS_ACTIONS.REPLACE_ACCOUNT_HB_ANALYTIC_DATA:
		// 	return { ...state, account: { fetched: true, data: action.data } };

		default:
			return state;
	}
};

export default hbAnalytics;