import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import channelData from './channelReducer';
import variationByIds from './variationReducer';
import adByIds from './adReducer';
import sectionByIds from './sectionReducer';
import ui from './uiReducer';
import siteData from './siteReducer';
import reporting from './reportingReducer';
import networkConfig from './networkConfigReducer';

export default combineReducers({
	adByIds,
	sectionByIds,
	variationByIds,
	channelData,
	siteData,
	ui,
	reporting,
	networkConfig,
	form: formReducer // key Name should be form only
});
