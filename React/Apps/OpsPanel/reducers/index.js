import { combineReducers } from 'redux';
import sites from './siteMappingReducer';
import liveSites from './liveSitesMappingReducer';

export default combineReducers({
	sites,
	liveSites
});
