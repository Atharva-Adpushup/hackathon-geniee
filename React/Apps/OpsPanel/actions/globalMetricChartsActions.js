import { globalMetricChartsActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const fetchNetworkWiseData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalNetworkWiseData',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_NETWORK_WISE_DATA, data: response.data });
	});
};

const fetchMetricsData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalMetricsData',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_METRICS_DATA, data: response.data });
	});
};

const fetchModeWiseTrafficData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalModeWiseData',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_MODE_WISE_TRAFFIC_DATA, data: response.data });
	});
};

export { fetchNetworkWiseData, fetchMetricsData, fetchModeWiseTrafficData };
