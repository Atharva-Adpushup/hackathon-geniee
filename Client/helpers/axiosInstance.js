import axios from 'axios';
import config from '../config/config';

const { API_ROOT } = config;

const axiosInstance = axios.create({
	baseURL: API_ROOT,
	withCredentials: true
});

const apiMonitoringReqInterceptorHandler = (req, globalClientConfig) => {
	const { url } = req;
	const { API_MONITORING } = globalClientConfig;
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

const apiMonitoringErrorResInterceptorHandler = (res, globalClientConfig) => {
	const { API_MONITORING } = globalClientConfig;
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
	} else {
		throw res;
	}
};

axiosInstance
	.get('/getGlobalClientConfig')
	.then(response => response.data)
	.then(resp => {
		const { globalClientConfig } = resp.data;
		axiosInstance.interceptors.request.use(req =>
			apiMonitoringReqInterceptorHandler(req, globalClientConfig)
		);
		axiosInstance.interceptors.response.use(
			// success
			res => res,
			// error
			res => apiMonitoringErrorResInterceptorHandler(res, globalClientConfig)
		);
	});

export default axiosInstance;
