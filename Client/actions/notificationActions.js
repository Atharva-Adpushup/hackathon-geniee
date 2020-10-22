import { NOTIFICATION_ACTIONS } from '../constants/global';

const replaceUnseenNotifications = notifications => dispatch =>
	dispatch({
		type: NOTIFICATION_ACTIONS.REPLACE_NOTIFICATIONS,
		data: notifications
	});

const addUnseenNotification = notification => dispatch =>
	dispatch({
		type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
		data: notification
	});

const appendNotifications = notifications => dispatch =>
	dispatch({
		type: NOTIFICATION_ACTIONS.APPEND_NOTIFICATIONS,
		data: notifications
	});

export { replaceUnseenNotifications, addUnseenNotification, appendNotifications };
