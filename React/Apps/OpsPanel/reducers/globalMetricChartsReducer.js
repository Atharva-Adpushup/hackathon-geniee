import { globalMetricChartsActions } from '../configs/commonConsts';

const globalMetricCharts = (state = {}, action) => {
	switch (action.type) {
		case globalMetricChartsActions.SET_GLOBAL_METRIC_DATA:
			return { ...action.data };
			break;

		default:
			return state;
	}
};

export default globalMetricCharts;
