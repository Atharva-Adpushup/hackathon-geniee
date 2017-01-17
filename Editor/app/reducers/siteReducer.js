import { combineReducers } from 'redux';
import { status, siteModes, siteActions } from 'consts/commonConsts';

const modeStatus = (state = { mode: siteModes.DRAFT }, action) => {
		switch (action.type) {
			case siteActions.CHANGE_SITE_MODE:
				return {
					mode: action.mode
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
	modeStatus, siteData
});
