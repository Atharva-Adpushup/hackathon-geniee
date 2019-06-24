import { SITE_ACTIONS, UI_ACTIONS } from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';

const fetchAppStatuses = siteId => dispatch =>
	axiosInstance
		.get('/site/fetchAppStatuses', { params: { siteId } })
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA,
				data
			});
		})
		.catch(err => errorHandler(err));

const addNewSite = siteObj => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_DATA,
		data: siteObj
	});

const updateSiteStep = (siteId, step, onboardingStage) => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_STEP,
		data: { siteId, step, onboardingStage }
	});

const updateApConfig = (siteId, apConfigs) => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
		data: { siteId, key: 'apConfigs', value: apConfigs }
	});

const saveSettings = (siteId, siteData) => dispatch =>
	axiosInstance
		.post('/site/saveSettings', { siteId, ...siteData })
		.then(() => {
			const { apConfigs, adNetworkSettings } = siteData;
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: { siteId, key: 'apConfigs', value: apConfigs }
			});
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: { siteId, key: 'adNetworkSettings', value: adNetworkSettings }
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Site settings saved successfully'
			});
		})
		.catch(err => errorHandler(err));

const getAppStatuses = siteId => dispatch =>
	axiosInstance
		.get('/site/getAppStatuses', { params: { siteId } })
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA,
				data
			});
		})
		.catch(err => errorHandler(err));

export {
	fetchAppStatuses,
	addNewSite,
	updateSiteStep,
	updateApConfig,
	saveSettings,
	getAppStatuses
};
