import { adActions, uiActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const createAd = params => (dispatch, getState) => {
		return ajax({
			url: '/interactiveAdsManager/data/createAd',
			method: 'POST',
			data: JSON.stringify(params)
		}).then(response => {
			if (response.error) {
				return alert('Ad creation failed');
			} else {
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
				return alert('Ad fetching failed');
			} else {
				dispatch({ type: adActions.REPLACE_ADS_LIST, data: response.data.ads });
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
				return alert('Delete Ad failed');
			} else {
				dispatch({ type: adActions.DELETE_AD, adId: params.adId });
			}
		});
	},
	updateAd = (adId, data) => (dispatch, getState) => {
		return dispatch({
			type: adActions.UPDATE_AD,
			data: {
				id: adId,
				updateThis: data
			}
		});
	},
	modifyAdOnServer = (adId, data) => (dispatch, getState) => {
		return ajax({
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
	};

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer };
