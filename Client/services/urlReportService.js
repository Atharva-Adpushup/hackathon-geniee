import axiosInstance from '../helpers/axiosInstance';
import config from '../config/config';

export default {
	getCustomStats: params => {
		const url = config.URL_ANALYTICS_API_CUSTOM_DATA;
		return axiosInstance.get(url, { params });
	},
	getWidgetData: params => {
		const url = config.URL_ANALYTICS_API_WIDGET_DATA;
		return axiosInstance.get(url, { params });
	},
	getLastUpdateStatus: params => {
		const url = config.URL_ANALYTICS_API_UPDATE_STATUS;
		return axiosInstance.get(url, { params });
	},
	getGraphData: params => {
		const url = config.URL_ANALYTICS_API_CUSTOM_GRAPH_DATA;
		return axiosInstance.get(url, { params });
	},
	getMetaData: params => axiosInstance.get('/url/getMetaData', { params })
};
