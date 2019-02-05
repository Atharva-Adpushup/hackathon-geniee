import { combineReducers } from 'redux';
import apps from './apps/index';
import global from './global/index';
import routes from './routes/index';

export default combineReducers({ apps, global, routes });
