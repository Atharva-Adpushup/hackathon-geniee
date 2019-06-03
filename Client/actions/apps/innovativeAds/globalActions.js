/* eslint-disable no-alert */
import { GLOBAL_ACTIONS } from '../../../constants/innovativeAds';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';
import { getAdsAndGlobal } from '../../../Apps/InnovativeAds/lib/helpers';

const masterSave = siteId => (_, getState) => {
	const props = {
		match: {
			params: {
				siteId
			}
		}
	};
	const { ads, global } = getAdsAndGlobal(getState(), props);
	const data = {
		siteId,
		ads: ads.content,
		meta: global.meta.content
	};
	return axiosInstance
		.post('/innovativeAds/masterSave', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};

const resetCurrentAd = siteId => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, siteId, currentAd: null });

const fetchMeta = siteId => dispatch =>
	axiosInstance
		.get('/innovativeAds/fetchMeta', {
			params: {
				siteId
			}
		})
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: GLOBAL_ACTIONS.SET_CHANNELS,
				data: data.channels,
				siteId
			});
			dispatch({
				type: GLOBAL_ACTIONS.REPLACE_META,
				data: data.meta,
				siteId
			});
		})
		.catch(err => errorHandler(err, 'App Initialization Failed'));

export { masterSave, resetCurrentAd, fetchMeta };
