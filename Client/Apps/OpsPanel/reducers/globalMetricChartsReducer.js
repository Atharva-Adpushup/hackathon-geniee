import { globalMetricChartsActions } from '../configs/commonConsts';
const defaultState = {
		networkWise: {},
		metrics: {},
		modeWiseTraffic: {},
		top10Countries: {},
		top10Sites: {},
		lostAndFoundLiveSites: {}
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
			case globalMetricChartsActions.SET_TOP_10_COUNTRIES_DATA:
				return { ...state, top10Countries: { ...action.data } };
				break;
			case globalMetricChartsActions.SET_TOP_10_SITES_DATA:
				return { ...state, top10Sites: { ...action.data } };
				break;
			case globalMetricChartsActions.SET_LOST_AND_FOUND_LIVE_SITES_DATA:
				return { ...state, lostAndFoundLiveSites: { ...action.data } };
				break;

			default:
				return state;
		}
	};

export default globalMetricCharts;
