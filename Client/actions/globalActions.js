import {
	USER_ACTIONS,
	NETWORK_CONFIG_ACTIONS,
	SITE_ACTIONS,
	REPORTS_ACTIONS,
	UI_ACTIONS
} from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';

const fetchGlobalData = () => dispatch =>
	axiosInstance
		.get('/globalData')
		.then(response => {
			const { data } = response;
			dispatch({
				type: USER_ACTIONS.REPLACE_USER_DATA,
				data: data.user
			});
			dispatch({
				type: NETWORK_CONFIG_ACTIONS.REPLACE_NETWORK_CONFIG,
				data: data.networkConfig
			});
			dispatch({
				type: SITE_ACTIONS.REPLACE_SITE_DATA,
				data: data.sites
			});
		})
		.catch(err => errorHandler(err));

const updateGlobalReportMetaData = data => dispatch =>
	dispatch({
		type: REPORTS_ACTIONS.REPLACE_GLOBAL_REPORT_DATA,
		data
	});

const updateAccountReportMetaData = data => dispatch =>
	dispatch({
		type: REPORTS_ACTIONS.REPLACE_ACCOUNT_REPORT_DATA,
		data
	});

const updateNetworkConfig = config => dispatch =>
	axiosInstance
		.post('/updateNetworkConfig', { config })
		.then(response => {
			const { data } = response;
			dispatch({
				type: NETWORK_CONFIG_ACTIONS.REPLACE_NETWORK_CONFIG,
				data: data.data.networkConfig
			});
			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Network Config Updated Updated'
			});
		})
		.catch(err => errorHandler(err));

export {
	fetchGlobalData,
	updateNetworkConfig,
	updateGlobalReportMetaData,
	updateAccountReportMetaData
};
