import axiosInstance from '../helpers/axiosInstance';
import config from '../config/config';

export default {
	getCustomStats: params => {
		const url = config.URL_ANALYTICS_API_CUSTOM_DATA;
		return axiosInstance.get(url, { params });
	},
	getMetaData: params => axiosInstance.get('/url/getMetaData', { params })
};
