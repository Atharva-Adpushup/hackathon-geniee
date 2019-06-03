import { combineReducers } from 'redux';
import { USER_ACTIONS } from '../constants/global';
import apps from './apps/index';
import global from './global/index';
import routes from './routes/index';

const appReducer = combineReducers({ apps, global, routes });
const rootReducer = (state, action) => {
	let newState = { ...state };
	if (action.type === USER_ACTIONS.LOGOUT_USER || action.type === USER_ACTIONS.RESET_STATE) {
		newState = undefined;
	}

	return appReducer(newState, action);
};

export default rootReducer;
