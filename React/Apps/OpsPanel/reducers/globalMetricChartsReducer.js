import { globalMetricChartsActions } from '../configs/commonConsts';
const defaultState = {
		networkWise: {}
	},
	globalMetricCharts = (state = defaultState, action) => {
		switch (action.type) {
			case globalMetricChartsActions.SET_NETWORK_WISE_DATA:
				return { ...state, networkWise: { ...action.data } };
				break;

			default:
				return state;
		}
	};

export default globalMetricCharts;
