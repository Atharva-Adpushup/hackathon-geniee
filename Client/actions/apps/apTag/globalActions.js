import { GLOBAL_ACTIONS } from '../../../constants/apTag';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const masterSave = siteId => (_, getState) => {
	const data = { siteId, ads: getState().ads.content };
	axiosInstance
		.post('/apTag/masterSave', { data })
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};

const resetCurrentAd = () => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: null });

export { masterSave, resetCurrentAd };
