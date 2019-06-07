import { PAGEGROUP_ACTIONS } from '../../../constants/opsPanel';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const createPagegroups = (siteId, channels) => dispatch =>
	axiosInstance
		.post('/channel/createPagegroups', { siteId, channels })
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: AD_ACTIONS.UPDATE_ADS_LIST,
				data: { ...params.ad, id: data.id },
				siteId: params.siteId
			});
			return dispatch({
				type: GLOBAL_ACTIONS.SET_CURRENT_AD,
				currentAd: data.id,
				siteId: params.siteId
			});
		})
		.catch(err => errorHandler(err, 'Ad Creation Failed. Please contact AdPushup Operations Team'));

export { createPagegroups };
