import { combineReducers } from 'redux';
import sites from './siteMappingReducer';
import liveSites from './liveSitesMappingReducer';
import globalMetricCharts from './globalMetricChartsReducer';

export default combineReducers({
	sites,
	liveSites,
	globalMetricCharts
});
