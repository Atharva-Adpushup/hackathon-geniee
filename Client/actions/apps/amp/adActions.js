import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../../constants/amp';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const createAd = params => dispatch =>
	axiosInstance
		.post('/amp/createAd', params)
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: AD_ACTIONS.UPDATE_ADS_LIST,
				data: data.doc,
				siteId: params.siteId
			});
			return dispatch({
				type: GLOBAL_ACTIONS.SET_CURRENT_AD,
				currentAd: data.doc.id,
				maxHeight: params.ad.maxHeight,
				siteId: params.siteId
			});
		})
		.catch(err => errorHandler(err, 'Ad Creation Failed. Please contact AdPushup Operations Team'));

const fetchAds = params => dispatch =>
	axiosInstance
		.get('/amp/fetchAds', { params })
		.then(response => {
			const { data } = response.data;
			return dispatch({ type: AD_ACTIONS.REPLACE_ADS_LIST, data: data.ads, siteId: params.siteId });
		})
		.catch(err => errorHandler(err, 'Ad Fetching Failed'));

const deleteAd = params => dispatch =>
	axiosInstance
		.post('/apTag/deleteAd', { params })
		.then(() => dispatch({ type: AD_ACTIONS.DELETE_AD, adId: params.adId, siteId: params.siteId }))
		.catch(err => errorHandler(err, 'Ad Deletion Failed'));

const updateAd = (adId, siteId, data) => dispatch =>
	dispatch({
		type: AD_ACTIONS.UPDATE_AD,
		data: {
			id: adId,
			updateThis: data
		},
		siteId
	});

const modifyAdOnServer = (siteId, adId, data) => dispatch =>
	axiosInstance
		.post('/amp/modifyAd', { siteId, adId, data })
		.then(() =>
			dispatch({
				type: AD_ACTIONS.UPDATE_AD,
				data: {
					id: adId,
					updateThis: data
				},
				siteId
			})
		)
		.catch(err => errorHandler(err));

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer };
