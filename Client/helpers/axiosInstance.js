import axios from 'axios';
import config from '../config/config';
import { API_MONITORING } from '../../configs/config';

const { API_ROOT } = config;

const axiosInstance = axios.create({
	baseURL: API_ROOT,
	withCredentials: true
});

const apiMonitoringReqInterceptorHandler = req => {
	const { url } = req;
	// replace params to get the api endpoint
	const sanitizedURL = url.replace(/\?.*/, '');

	if (API_MONITORING.ENDPOINTS.includes(sanitizedURL)) {
		req.meta = req.meta || {};
		// set time of request
		req.meta.requestStartedAt = new Date().getTime();
		req.timeout = API_MONITORING.TIMEOUT;
	}

	return req;
};
axiosInstance.interceptors.request.use(apiMonitoringReqInterceptorHandler);

const apiMonitoringErrorResInterceptorHandler = res => {
	// only for req that needs to be monitored
	if (res.config && res.config.meta && res.config.meta.requestStartedAt) {
		// time difference between the request start and response received
		const executionTime =
			new Date().getTime() - ((res.config.meta && res.config.meta.requestStartedAt) || 0);

		const isRequestTimedout = executionTime > API_MONITORING.TIMEOUT; // if response time is freate than timeout time
		if (isRequestTimedout) {
			const errResponse = `${API_MONITORING.TIMEOUT_ERROR_MESSAGE} for: ${res.config.url}: ${executionTime} ms`;
			axiosInstance.post('/data/createNetworkLog', {
				url: res.config.url,
				err: errResponse
			});
		}
		// .then(() => console.log('Log Written'))
		// .catch(error => console.log(`Log written failed : ${error}`));
	} else {
		throw res;
	}
};
axiosInstance.interceptors.response.use(
	// success
	res => res,
	// error
	apiMonitoringErrorResInterceptorHandler
);

export default axiosInstance;
