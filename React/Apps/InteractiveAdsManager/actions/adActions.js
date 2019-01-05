import { adActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const createAd = params => (dispatch, getState) =>
	ajax({
		url: '/interactiveAdsManager/data/createAd',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return alert('Ad creation failed');
		}
		dispatch({ type: adActions.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
		dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.id });

		const { ad } = params;
		let adsKeys = [];
		let mode;

		if (ad.pagegroups && ad.pagegroups.length) {
			adsKeys = ad.pagegroups.map(pg => {
				if (ad.format) return `${ad.formatData.platform}-${ad.format}-${pg}`;
			});
			mode = 'pagegroups';
		} else {
			adsKeys = `${ad.formatData.platform}-${ad.format}`;
			mode = 'custom';
		}

		dispatch({
			type: globalActions.UPDATE_META,
			value: {
				mode,
				adsKeys,
				toIncrement:  
			}
		})
	});
const fetchAds = params => dispatch =>
	ajax({
		url: '/tagManager/fetchAds',
		method: 'GET',
		data: params
	}).then(response => {
		if (response.error) {
			return alert('Ad fetching failed');
		}
		dispatch({ type: adActions.REPLACE_ADS_LIST, data: response.data.ads });
	});
const deleteAd = params => dispatch =>
	ajax({
		url: '/tagManager/deleteAd',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return alert('Delete Ad failed');
		}
		dispatch({ type: adActions.DELETE_AD, adId: params.adId });
	});
const updateAd = (adId, data) => dispatch =>
	dispatch({
		type: adActions.UPDATE_AD,
		data: {
			id: adId,
			updateThis: data
		}
	});
const modifyAdOnServer = (adId, data) => dispatch =>
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
