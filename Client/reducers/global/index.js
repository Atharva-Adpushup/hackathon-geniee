import { combineReducers } from 'redux';
import user from './user';
import networkConfig from './networkConfig';
import sites from './sites';

export default combineReducers({ user, networkConfig, sites });
