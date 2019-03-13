import { UI_ACTIONS } from '../constants/global';

const hideNotification = () => dispatch =>
	dispatch({
		type: UI_ACTIONS.HIDE_NOTIFICATION
	});

const showNotification = params => dispatch =>
	dispatch({
		type: UI_ACTIONS.SHOW_NOTIFICATION,
		...params
	});

export { hideNotification, showNotification };
