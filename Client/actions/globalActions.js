import {
	USER_ACTIONS,
	NETWORK_CONFIG_ACTIONS,
	SITE_ACTIONS,
	REPORTS_ACTIONS,
	ADS_TXT_ACTIONS
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
				type: ADS_TXT_ACTIONS.REPLACE_ADS_TXT,
				data: data.adsTxt
			});
			dispatch({
				type: SITE_ACTIONS.REPLACE_SITE_DATA,
				data: data.sites
			});
			dispatch({
				type: REPORTS_ACTIONS.REPLACE_REPORTS_DATA,
				data: data.reports
			});
		})
		.catch(err => {
			return errorHandler(err);
		});

export default fetchGlobalData;
