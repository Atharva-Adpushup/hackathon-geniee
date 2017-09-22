import { uiActions, status } from 'consts/commonConsts';
import { masterSave } from 'libs/dataSyncService';
import { getFinalJson } from 'selectors/siteSelectors';
import _ from 'lodash';

const masterSaveData = mode => (dispatch, getState) => {
	dispatch({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.PENDING });
	const paramData = getFinalJson(_.cloneDeep(getState()));
	let updateModeStatus = false;

	if (mode) {
		paramData.siteMode = mode;
		updateModeStatus = true;
	}

	return masterSave(paramData)
		.done(data => {
			if (data.success) {
				dispatch({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.SUCCESS, updateModeStatus });
			} else {
				dispatch({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.FAILED });
			}
		})
		.fail(() => {
			dispatch({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.FAILED });
		});
};

export { masterSaveData };
