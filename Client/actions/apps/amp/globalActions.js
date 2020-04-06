/* eslint-disable no-alert */
import { GLOBAL_ACTIONS } from '../../../constants/amp';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';
import { getAdsAndGlobal } from '../../../Apps/amp/lib/helpers';

const masterSave = siteId => (_, getState) => {
	const { ads } = getAdsAndGlobal(getState(), {
		match: {
			params: {
				siteId
			}
		}
	});
	const data = { siteId, ads: ads.content };
	return axiosInstance
		.post('/apTag/masterSave', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};

const resetCurrentAd = siteId => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: null, siteId });

export { masterSave, resetCurrentAd };
