import axiosInstance from '../helpers/axiosInstance';
import config from '../config/config';
export default {
	getCustomStats: params => {
		let url = config.ANALYTICS_API_CUSTOM_DATA;
		return axiosInstance.get(url, { params });
	},
	getWidgetData: params => {
		let url = config.ANALYTICS_API_WIDGET_DATA;
		return axiosInstance.get(url, { params });
	}
};
