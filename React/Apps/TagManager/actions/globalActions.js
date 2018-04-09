import { uiActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const masterSave = siteId => (dispatch, getState) => {
	const data = { siteId, ads: getState().ads };
	return ajax({
		url: '/tagManager/masterSave',
		method: 'POST',
		data: JSON.stringify(data)
	}).then(response => {
		if (response.error) {
			alert('Some error occurred');
			return;
		}
		alert('Save successful');
		// console.log(response);
		// if (response.error) {
		// 	dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: true });
		// } else {
		// 	dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: false });
		// 	dispatch({ type: adActions.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
		// 	dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.id });
		// }
	});
};

export { masterSave };
