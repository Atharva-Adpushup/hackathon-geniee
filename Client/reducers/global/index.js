import { combineReducers } from 'redux';
import user from './user';
import networkConfig from './networkConfig';

export default combineReducers({ user, networkConfig });
