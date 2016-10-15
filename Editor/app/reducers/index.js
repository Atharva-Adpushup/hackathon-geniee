import { combineReducers } from 'redux';
import channelData from './channelReducer';
import variationByIds from './variationReducer';
import adByIds from './adReducer';
import sectionByIds from './sectionReducer';
import insertMenu from './insertMenuReducer';

export default combineReducers({
	adByIds,
	sectionByIds,
	variationByIds,
	channelData,
	insertMenu
});
