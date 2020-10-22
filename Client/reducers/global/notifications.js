import { NOTIFICATION_ACTIONS } from '../../constants/global';

const notifications = (state = [], action) => {
	switch (action.type) {
		case NOTIFICATION_ACTIONS.REPLACE_NOTIFICATIONS:
			return [...action.data];
		case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
			return [action.data, ...state];
		case NOTIFICATION_ACTIONS.APPEND_NOTIFICATIONS:
			return [...state, ...action.data];
		default:
			return state;
	}
};

export default notifications;
