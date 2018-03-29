import { adActions, uiActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const createAd = params => (dispatch, getState) => {
		return ajax({
			url: '/tagManager/createAd',
			method: 'POST',
			data: JSON.stringify(params)
		}).then(response => {
			if (response.error) {
				dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: true });
			} else {
				dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: false });
				dispatch({ type: adActions.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
				dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.id });
			}
		});
	},
	fetchAds = params => (dispatch, getState) => {
		return ajax({
			url: '/tagManager/fetchAds',
			method: 'GET',
			data: params
		}).then(response => {
			if (response.error) {
				dispatch({ type: uiActions.SET_FETCH_ADS_ERROR, value: true });
			} else {
				dispatch({ type: uiActions.SET_FETCH_ADS_ERROR, value: false });
				dispatch({ type: adActions.UPDATE_ADS_LIST, data: response.data.ads });
			}
		});
	},
	deleteAd = parmas => (dispatch, getState) => {
		return ajax({
			url: '/tagManager/deleteAd',
			method: 'POST',
			data: JSON.stringify(params)
		}).then(response => {
			if (response.error) {
				alert('Delete Ad failed');
			} else {
				dispatch({ type: adActions.DELETE_AD, adId: params.adId });
			}
		});
	};

export { createAd, fetchAds, deleteAd };
