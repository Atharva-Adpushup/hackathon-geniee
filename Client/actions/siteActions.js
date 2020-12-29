import cloneDeep from 'lodash/cloneDeep';

import { SITE_ACTIONS, UI_ACTIONS, USER_ACTIONS } from '../constants/global';
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

const saveSettings = (siteId, siteData, dataForAuditLogs) => dispatch => {
	axiosInstance
		.post('/site/saveSettings', { siteId, ...siteData, dataForAuditLogs })
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
};

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

const updateSiteAutoOptimise = (siteId, params, dataForAuditLogs) => dispatch =>
	axiosInstance
		.post('/site/updateSite', {
			siteId,
			toUpdate: [
				{
					key: 'apConfigs',
					value: { autoOptimise: params.autoOptimise },
					requireResponse: false
				}
			],
			dataForAuditLogs
		})
		.then(() => {
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: { siteId, key: 'apConfigs', value: { autoOptimise: params.autoOptimise } }
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Settings Updated'
			});
		})
		.catch(err => errorHandler(err));

const updateAppStatus = (siteId, params, dataForAuditLogs) => dispatch =>
	axiosInstance
		.post('/site/updateSite', {
			siteId,
			toUpdate: [
				{
					key: 'apps',
					value: { [params.app]: params.value },
					requireResponse: false
				}
			],
			dataForAuditLogs
		})
		.then(() => {
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: { siteId, key: 'apps', value: { [params.app]: params.value } }
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'App Updated'
			});
		})
		.catch(err => errorHandler(err));

const updateSite = (siteId, params, dataForAuditLogs) => dispatch =>
	axiosInstance
		.post('/site/updateSite', {
			siteId,
			toUpdate: [...params],
			dataForAuditLogs
		})
		.then(() => {
			params.forEach(data => {
				dispatch({
					type: SITE_ACTIONS.UPDATE_SITE_DATA,
					data: { siteId, [data.key]: data.value }
				});
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Site Updated'
			});
		})
		.catch(err => errorHandler(err));

const deleteSite = siteId => (dispatch, getState) =>
	axiosInstance
		.post('/site/deleteSite', { siteId })
		.then(() => {
			const state = getState();
			const { user, sites } = state.global;
			const { data: sitesData } = sites;
			const {
				data: { sites: userSites }
			} = user;

			const sitesDataClone = cloneDeep(sitesData);
			delete sitesDataClone[siteId];

			const userSitesClone = cloneDeep(userSites);
			delete userSitesClone[siteId];

			dispatch({
				type: SITE_ACTIONS.REPLACE_SITE_DATA,
				data: sitesDataClone
			});

			dispatch({
				type: USER_ACTIONS.REPLACE_USER_DATA,
				data: {
					sites: userSitesClone
				}
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Site successfully deleted'
			});
		})
		.catch(err => errorHandler(err));

const fetchSiteInventories = siteId => dispatch =>
	axiosInstance
		.get(`/site/${siteId}/inventories`)
		.then(({ data: { data: inventories = [] } }) => {
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_INVENTORIES,
				data: { siteId, inventories }
			});
		})
		.catch(err => errorHandler(err));

const resetSiteInventories = siteId => dispatch => {
	dispatch({ type: SITE_ACTIONS.UPDATE_SITE_INVENTORIES, data: { siteId, inventories: [] } });
};

export {
	fetchAppStatuses,
	addNewSite,
	updateSiteStep,
	updateApConfig,
	saveSettings,
	getAppStatuses,
	updateSiteAutoOptimise,
	updateAppStatus,
	updateSite,
	deleteSite,
	fetchSiteInventories,
	resetSiteInventories
};
