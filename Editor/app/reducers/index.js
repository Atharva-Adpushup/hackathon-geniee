import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import channelData from './channelReducer';
import variationByIds from './variationReducer';
import adByIds from './adReducer';
import sectionByIds from './sectionReducer';
import ui from './uiReducer';


export default combineReducers({
	adByIds,
	sectionByIds,
	variationByIds,
	channelData,
	ui,
	form: formReducer // key Name should be form only
});
