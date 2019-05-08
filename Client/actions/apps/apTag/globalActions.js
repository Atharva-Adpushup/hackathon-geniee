/* eslint-disable no-alert */
import { GLOBAL_ACTIONS } from '../../../constants/apTag';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const masterSave = siteId => (_, getState) => {
	const data = { siteId, ads: getState().apps.apTag.ads.content };
	return axiosInstance
		.post('/apTag/masterSave', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};

const resetCurrentAd = () => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: null });

export { masterSave, resetCurrentAd };
