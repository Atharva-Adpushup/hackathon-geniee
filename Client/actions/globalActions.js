import { USER_ACTIONS, NETWORK_CONFIG_ACTIONS, SITE_ACTIONS } from '../constants/global';
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

export { fetchGlobalData };
