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
			// dispatch({
			// 	type: REPORTS_ACTIONS.REPLACE_REPORTS_DATA,
			// 	data: data.reports
			// });
		})
		.catch(err => errorHandler(err));

const fetchReportingMeta = data => dispatch =>
	// axiosInstance
	// 	.get('/reports/getMetaData', { params: { sites } })
	// 	.then(response => {
	// 		const { data } = response;
	dispatch({
		type: REPORTS_ACTIONS.REPLACE_REPORTS_DATA,
		data
	});
// })
// .catch(err => errorHandler(err));

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

export { fetchGlobalData, updateNetworkConfig, fetchReportingMeta };
