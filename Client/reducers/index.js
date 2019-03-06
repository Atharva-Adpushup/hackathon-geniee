import { combineReducers } from 'redux';
import { USER_ACTIONS } from '../constants/global';
import apps from './apps/index';
import global from './global/index';
import routes from './routes/index';

const appReducer = combineReducers({ apps, global, routes });
const rootReducer = (state, action) => {
	if (action.type === USER_ACTIONS.LOGOUT_USER) {
		state = undefined;
	}

	return appReducer(state, action);
};

export default rootReducer;
