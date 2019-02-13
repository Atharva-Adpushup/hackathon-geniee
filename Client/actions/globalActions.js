import { USER_ACTIONS, NETWORK_CONFIG_ACTIONS } from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';

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
		})
		.catch(err => {
			console.log(err);
		});

export { fetchGlobalData };
