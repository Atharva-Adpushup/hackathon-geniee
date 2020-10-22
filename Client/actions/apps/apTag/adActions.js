import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../../constants/apTag';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const createAd = params => dispatch =>
	axiosInstance
		.post('/apTag/createAd', params)
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: AD_ACTIONS.UPDATE_ADS_LIST,
				data: { ...params.ad, id: data.id, name: data.name },
				siteId: params.siteId
			});
			return dispatch({
				type: GLOBAL_ACTIONS.SET_CURRENT_AD,
				currentAd: data.id,
				maxHeight: params.ad.maxHeight,
				siteId: params.siteId
			});
		})
		.catch(err => errorHandler(err, 'Ad Creation Failed. Please contact AdPushup Operations Team'));

const fetchAds = params => dispatch =>
	axiosInstance
		.get('/apTag/fetchAds', { params })
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
		.post('/apTag/modifyAd', { siteId, adId, data })
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

const updateAllAds = (siteId, data) => dispatch =>
	dispatch({
		type: AD_ACTIONS.REPLACE_ADS_LIST,
		data,
		siteId
	});

const replaceAds = (siteId, ads) => dispatch =>
	dispatch({
		type: AD_ACTIONS.REPLACE_ADS_LIST,
		data: ads,
		siteId
	});

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer, updateAllAds, replaceAds };
