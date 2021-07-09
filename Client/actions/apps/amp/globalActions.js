/* eslint-disable no-alert */
import { GLOBAL_ACTIONS } from '../../../constants/amp';
import { GLOBAL_ACTIONS_AMP } from '../../../constants/ampNew';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';
import { getAdsAndGlobal, getAdsAndGlobalForAmpNew } from '../../../Apps/AmpTag/lib/helpers';

const masterSave = (adsToUpdate, siteId, dataForAuditLogs) => (_, getState) => {
	const { ads } = getAdsAndGlobal(getState(), {
		match: {
			params: {
				siteId
			}
		}
	});
	const data = { siteId, adsToUpdate, ads: ads.content, dataForAuditLogs };
	return axiosInstance
		.post('/amp/masterSave', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};
// for new AMP Tag format
const masterSaveAmp = (adsToUpdate, siteId, dataForAuditLogs) => (_, getState) => {
	const { ads } = getAdsAndGlobalForAmpNew(getState(), {
		match: {
			params: {
				siteId
			}
		}
	});
	const data = { siteId, adsToUpdate, ads: ads.content, dataForAuditLogs };
	return axiosInstance
		.post('/amp/masterSaveAmp', data)
		.then(() => window.alert('Save successful'))
		.catch(err => errorHandler(err, 'Master Save Failed'));
};
const resetCurrentAd = siteId => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: null, siteId });

const resetCurrentAdAmp = siteId => dispatch =>
	dispatch({ type: GLOBAL_ACTIONS_AMP.SET_CURRENT_AD, currentAd: null, siteId });

export { masterSave, masterSaveAmp, resetCurrentAd, resetCurrentAdAmp };
