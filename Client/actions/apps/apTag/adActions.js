import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../../constants/apTag';
import axiosInstance from '../../../helpers/axiosInstance';

const createAd = params => dispatch =>
	axiosInstance
		.post('/apTag/createAd', params)
		.then(response => {
			if (response.error) {
				return alert('Ad creation failed');
			}
			dispatch({ type: AD_ACTIONS.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
			dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: response.data.id });
		})
		.catch(err => console.log(err));

const fetchAds = params => dispatch =>
	axiosInstance
		.get('/apTag/fetchAds', { params })
		.then(response => {
			const { data } = response.data;
			if (response.error) {
				return alert('Ad fetching failed');
			}
			dispatch({ type: AD_ACTIONS.REPLACE_ADS_LIST, data: data.ads });
		})
		.catch(err => console.log(err));

const deleteAd = params => dispatch =>
	axiosInstance
		.post('/apTag/deleteAd', params)
		.then(response => {
			if (response.error) {
				return alert('Delete Ad failed');
			}
			dispatch({ type: AD_ACTIONS.DELETE_AD, adId: params.adId });
		})
		.catch(err => console.log(err));

const updateAd = (adId, data) => dispatch =>
	dispatch({
		type: AD_ACTIONS.UPDATE_AD,
		data: {
			id: adId,
			updateThis: data
		}
	});

const modifyAdOnServer = (adId, data) => dispatch =>
	axiosInstance
		.post('/apTag/modifyAd', { siteId: window.siteId, adId, data })
		.then(response => {
			if (response.error) {
				return alert(response.data.message);
			}
			return dispatch({
				type: AD_ACTIONS.UPDATE_AD,
				data: {
					id: adId,
					updateThis: data
				}
			});
		})
		.catch(err => console.log(err));

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer };
