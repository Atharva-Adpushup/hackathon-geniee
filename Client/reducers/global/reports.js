import { REPORTS_ACTIONS } from '../../constants/global';

const DEFAULT_REPORT_STATE = { fetched: false, data: {}, reportingDelayPopup: false };
const DEFAULT_STATE = {
	global: { ...DEFAULT_REPORT_STATE },
	account: { ...DEFAULT_REPORT_STATE },
	accountForSuperUser: { ...DEFAULT_REPORT_STATE }
};

const reports = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case REPORTS_ACTIONS.REPLACE_GLOBAL_REPORT_DATA:
			return { ...state, global: { fetched: true, data: action.data } };

		case REPORTS_ACTIONS.REPLACE_ACCOUNT_REPORT_DATA:
			return { ...state, account: { fetched: true, data: action.data } };

		case REPORTS_ACTIONS.REPLACE_SUPER_USER_ACCOUNT_REPORT_DATA:
			return {
				...state,
				accountForSuperUser: {
					fetched: true,
					data: action.data
				}
			};
		case REPORTS_ACTIONS.SHOW_REPORTING_DELAY_POPUP:
			return {
				...state,
				global: { ...state.global, reportingDelayPopup: action.flag }
			};

		default:
			return state;
	}
};

export default reports;
