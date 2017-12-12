import { globalMetricChartsActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const fetchGlobalMetricCharts = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getGlobalMetricCharts',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: globalMetricChartsActions.SET_GLOBAL_METRIC_DATA, data: response.data });
	});
};

export { fetchGlobalMetricCharts };
