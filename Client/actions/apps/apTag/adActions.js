import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../../constants/apTag';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const createAd = params => dispatch =>
	axiosInstance
		.post('/apTag/createAd', { params })
		.then(response => {
			dispatch({ type: AD_ACTIONS.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
			dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: response.data.id });
		})
		.catch(err => errorHandler(err, 'Ad Creation Failed. Please contact AdPushup Operations Team'));

const fetchAds = params => dispatch =>
	axiosInstance
		.get('/apTag/fetchAds', { params })
		.then(response => {
			const { data } = response.data;
			dispatch({ type: AD_ACTIONS.REPLACE_ADS_LIST, data: data.ads });
		})
		.catch(err => errorHandler(err, 'Ad Fetching Failed'));

const deleteAd = params => dispatch =>
	axiosInstance
		.post('/apTag/deleteAd', { params })
		.then(() => dispatch({ type: AD_ACTIONS.DELETE_AD, adId: params.adId }))
		.catch(err => errorHandler(err, 'Ad Deletion Failed'));

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
		.then(() =>
			dispatch({
				type: AD_ACTIONS.UPDATE_AD,
				data: {
					id: adId,
					updateThis: data
				}
			})
		)
		.catch(err => errorHandler(err));

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer };
