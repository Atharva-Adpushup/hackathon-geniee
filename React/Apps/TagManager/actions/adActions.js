import { adActions, uiActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const createAd = params => (dispatch, getState) =>
		ajax({
			url: '/tagManager/createAd',
			method: 'POST',
			data: JSON.stringify(params)
		}).then(response => {
			if (response.error) {
				return alert('Ad creation failed');
				// dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: true });
			}
			// dispatch({ type: uiActions.SET_CREATE_AD_ERROR, value: false });
			dispatch({
				type: adActions.UPDATE_ADS_LIST,
				data: { ...params.ad, id: response.data.id, name: response.data.name }
			});
			dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.id });
		}),
	fetchAds = params => (dispatch, getState) =>
		ajax({
			url: '/tagManager/fetchAds',
			method: 'GET',
			data: params
		}).then(response => {
			if (response.error) {
				return alert('Ad fetching failed');
				// dispatch({ type: uiActions.SET_FETCH_ADS_ERROR, value: true });
			}
			// dispatch({ type: uiActions.SET_FETCH_ADS_ERROR, value: false });
			dispatch({ type: adActions.REPLACE_ADS_LIST, data: response.data.ads });
		}),
	deleteAd = params => (dispatch, getState) =>
		ajax({
			url: '/tagManager/deleteAd',
			method: 'POST',
			data: JSON.stringify(params)
		}).then(response => {
			if (response.error) {
				return alert('Delete Ad failed');
			}
			dispatch({ type: adActions.DELETE_AD, adId: params.adId });
		}),
	updateAd = (adId, data) => (dispatch, getState) =>
		dispatch({
			type: adActions.UPDATE_AD,
			data: {
				id: adId,
				updateThis: data
			}
		}),
	modifyAdOnServer = (adId, data) => (dispatch, getState) =>
		ajax({
			url: '/tagManager/modifyAd',
			method: 'POST',
			data: JSON.stringify({ siteId: window.siteId, adId, data })
		}).then(response => {
			if (response.error) {
				return alert(response.data.message);
			}
			return dispatch({
				type: adActions.UPDATE_AD,
				data: {
					id: adId,
					updateThis: data
				}
			});
		});

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer };
