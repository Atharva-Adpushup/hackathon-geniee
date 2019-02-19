import { GLOBAL_ACTIONS } from '../../../constants/innovativeAds';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const masterSave = siteId => (_, getState) => {
	const data = {
		siteId,
		ads: getState().apps.innovativeAds.ads.content,
		meta: getState().apps.innovativeAds.global.meta.content
	};
	return axiosInstance
		.post('/innovativeAds/masterSave', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};

const resetCurrentAd = () => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: null });

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
				data: data.channels
			});
			dispatch({
				type: GLOBAL_ACTIONS.REPLACE_META,
				data: data.meta
			});
		})
		.catch(err => errorHandler(err, 'Master Save Failed'));

export { masterSave, resetCurrentAd, fetchMeta };
