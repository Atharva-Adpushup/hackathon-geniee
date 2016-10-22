import { editMenuActions, insertMenuActions, newChannelMenuActions } from '../consts/commonConsts';

const showEditMenu = (sectionId, adId, position) => ({ type: editMenuActions.SHOW_EDIT_MENU, sectionId, adId, position }),
	hideEditMenu = () => ({ type: editMenuActions.HIDE_EDIT_MENU }),
	showInsertMenu = (payload) => ({ type: insertMenuActions.SHOW_MENU, payload }),
	hideInsertMenu = () => ({ type: insertMenuActions.HIDE_MENU }),
	showNewChannelMenu = (position) => ({ type: newChannelMenuActions.SHOW_NEW_CHANNEL_MENU, position }),
	hideNewChannelInsertMenu = () => ({ type: newChannelMenuActions.HIDE_NEW_CHANNEL_MENU });

export { showEditMenu, showInsertMenu, hideEditMenu, hideInsertMenu, showNewChannelMenu, hideNewChannelInsertMenu };
