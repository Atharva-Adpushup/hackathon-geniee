import { globalMetricChartsActions } from '../configs/commonConsts';
const defaultState = {
		networkWise: {},
		metrics: {},
		modeWiseTraffic: {}
	},
	globalMetricCharts = (state = defaultState, action) => {
		switch (action.type) {
			case globalMetricChartsActions.SET_NETWORK_WISE_DATA:
				return { ...state, networkWise: { ...action.data } };
				break;
			case globalMetricChartsActions.SET_METRICS_DATA:
				return { ...state, metrics: { ...action.data } };
				break;
			case globalMetricChartsActions.SET_MODE_WISE_TRAFFIC_DATA:
				return { ...state, modeWiseTraffic: { ...action.data } };
				break;

			default:
				return state;
		}
	};

export default globalMetricCharts;
