import { combineReducers } from 'redux';
import { status, siteModes, uiActions } from 'consts/commonConsts';

const modeStatus = (state = { mode: siteModes.DRAFT }, action) => {
		switch (action.type) {
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				if ((action.status === status.SUCCESS) && (state.mode === siteModes.DRAFT)) {
					return {
						mode: siteModes.PUBLISH
					};
				} else if ((action.status === status.SUCCESS) && (state.mode === siteModes.PUBLISH)) {
					return {
						mode: siteModes.DRAFT
					};
				}

				return state;

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
