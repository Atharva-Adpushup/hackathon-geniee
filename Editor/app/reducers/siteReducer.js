import { combineReducers } from 'redux';
import { status } from 'consts/commonConsts';

const initialState = {
		status: 0
	},
	afterSaveLoader = (state = initialState, action) => {
		switch (action.type) {
			case status.text.RESET:
				return {
					status: status.RESET
				};
			case status.text.PENDING:
				return {
					status: status.PENDING
				};

			case status.text.SUCCESS:
				return {
					status: status.SUCCESS
				};

			case status.text.FAILED:
				return {
					status: status.FAILED
				};

			default:
				return state;
		}
	},
	siteData = (state = { partner: null }, action) => {
		switch (action.type) {
			case '':
				break;

			default:
				return state;
		}
	};

export default combineReducers({
	afterSaveLoader,
	siteData
});
