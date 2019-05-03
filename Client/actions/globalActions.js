import {
	USER_ACTIONS,
	NETWORK_CONFIG_ACTIONS,
	SITE_ACTIONS,
	REPORTS_ACTIONS
} from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';
import config from '../config/config';
const fetchGlobalData = () => dispatch =>
	Promise.all([
		axiosInstance.get('/globalData'),
		axiosInstance.get(config.ANALYTICS_API_ROOT + config.ANALYTICS_METAINFO_URL, {
			withCredentials: false
		})
	])
		.then(response => {
			let metaData = {},
				analyticsMetaInfo = {};
			const { data } = response[0];
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
			if (response[1].status == 200) {
				metaData = response[1].data && response[1].data.data ? response[1].data.data : {};
				analyticsMetaInfo = {};
				analyticsMetaInfo.dashboard = { widget: metaData.dashboard.widget };
				analyticsMetaInfo.metrics = metaData.metrics;
				analyticsMetaInfo.site = metaData.site;
			}
			dispatch({
				type: REPORTS_ACTIONS.REPLACE_REPORTS_DATA,
				data: analyticsMetaInfo
			});
		})
		.catch(err => errorHandler(err));

export { fetchGlobalData };
