import { REPORTS_ACTIONS } from '../../constants/global';

const reports = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case REPORTS_ACTIONS.REPLACE_REPORTS_DATA:
			return { fetched: true, data: action.data };
		default:
			return state;
	}
};

export default reports;
