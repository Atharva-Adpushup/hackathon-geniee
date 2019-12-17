import { combineReducers } from 'redux';
import user from './user';
import networkConfig from './networkConfig';
import sites from './sites';
import ui from './ui';
import reports from './reports';

export default combineReducers({ user, networkConfig, sites, ui, reports });