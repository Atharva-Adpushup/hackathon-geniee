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

const hideCopiedNotification = () => dispatch =>
	dispatch({
		type: UI_ACTIONS.HIDE_COPIED_NOTIFICATION
	});

const showCopiedNotification = (message, autoHideTime) => dispatch =>
	dispatch({
		type: UI_ACTIONS.SHOW_COPIED_NOTIFICATION,
		data: { message, autoHideTime }
	});

export { hideNotification, showNotification, hideCopiedNotification, showCopiedNotification };
