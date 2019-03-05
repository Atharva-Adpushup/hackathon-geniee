import { UI_ACTIONS } from '../../constants/global';
import { combineReducers } from 'redux';
const notifications = (state = { isVisible: false }, action) => {
	switch (action.type) {
		case UI_ACTIONS.SHOW_NOTIFICATION:
			return {
				...state,
				isVisible: true,
				title: action.title,
				message: action.message,
				mode: action.mode,
				autoDismiss: action.autoDismiss
			};

		case UI_ACTIONS.HIDE_NOTIFICATION:
			return {
				...state,
				isVisible: false,
				title: '',
				message: '',
				mode: ''
			};

		default:
			return state;
	}
};
export default combineReducers({ notifications });
