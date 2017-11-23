import { uiActions, status, siteModes } from 'consts/commonConsts';
import { masterSave } from 'libs/dataSyncService';
import { getFinalJson } from 'selectors/siteSelectors';
import { getEmptyAdCodes } from 'selectors/adsSelectors';
import _ from 'lodash';

const masterSaveData = mode => (dispatch, getState) => {
	const emptyCodes = getEmptyAdCodes(getState()),
		paramData = getFinalJson(_.cloneDeep(getState()));
	if (emptyCodes.length && mode == siteModes.PUBLISH) {
		/* When a variation/section deleted we just remove variation/selection not the ads from our redux, 
		hence possible that in some cases empty ads exist in redux but not when final json calculated. 
		Hence we added a very dirty and unoptimized check to stringify json and find index of empty ad in json.
		This will ensure that empty adcode is also in final json and hence then only show empty adcode error.
		*/
		if (JSON.stringify(paramData).indexOf(emptyCodes[0].id) !== -1) {
			return dispatch({
				type: uiActions.UPDATE_AFTER_SAVE_STATUS,
				status: status.FAILED,
				msg: 'Some empty adcodes present in the setup.'
			});
		}
	}

	dispatch({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.PENDING });

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
