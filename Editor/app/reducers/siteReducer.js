import { combineReducers } from 'redux';
import { status, siteModes, siteActions } from 'consts/commonConsts';

const afterSaveLoader = (state = { status: 0 }, action) => {
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
	modeStatus = (state = { mode: siteModes.DRAFT }, action) => {
		switch (action.type) {
			case siteActions.CHANGE_SITE_MODE:
				return {
					mode: action.mode
				};

			default:
				return state;
		}
	};

export default combineReducers({
	afterSaveLoader, modeStatus
});