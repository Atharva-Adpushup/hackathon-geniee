import { combineReducers } from 'redux';
import { UI_ACTIONS } from '../../constants/global';

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

const copiedNotification = (
	state = { isVisible: false, message: '', autoHideTime: null },
	action
) => {
	const { type: actionType, data: actionData } = action;
	switch (actionType) {
		case UI_ACTIONS.SHOW_COPIED_NOTIFICATION:
			return {
				...state,
				isVisible: true,
				message: actionData.message,
				autoHideTime: actionData.autoHideTime
			};

		case UI_ACTIONS.HIDE_COPIED_NOTIFICATION:
			return {
				...state,
				isVisible: false
			};

		default:
			return state;
	}
};
export default combineReducers({ notifications, copiedNotification });
