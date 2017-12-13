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

export { fetchNetworkWiseData };
