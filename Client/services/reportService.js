import axiosInstance from '../helpers/axiosInstance';
import config from '../config/config';
export default {
	getWidgetData: (path, params) => {
		let url = config.ANALYTICS_API_ROOT + path;
		console.log(url, params);
		return axiosInstance.get(url, { withCredentials: false, params });
	}
};
