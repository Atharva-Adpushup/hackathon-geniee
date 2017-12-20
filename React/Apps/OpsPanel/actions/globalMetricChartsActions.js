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

const fetchTop10CountriesData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalTop10Countries',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_TOP_10_COUNTRIES_DATA, data: response.data });
	});
};

const fetchTop10SitesData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalTop10Sites',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_TOP_10_SITES_DATA, data: response.data });
	});
};

const fetchLostAndFoundLiveSitesData = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalLostAndFoundLiveSites',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_LOST_AND_FOUND_LIVE_SITES_DATA, data: response.data });
	});
};

export {
	fetchNetworkWiseData,
	fetchMetricsData,
	fetchModeWiseTrafficData,
	fetchTop10CountriesData,
	fetchTop10SitesData,
	fetchLostAndFoundLiveSitesData
};
