import { combineReducers } from 'redux';
import ads from './adsReducer';
import ui from './uiReducer';
import global from './globalReducer';

export default combineReducers({ ads, ui, global });
