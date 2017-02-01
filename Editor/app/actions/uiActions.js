import { editMenuActions, insertMenuActions, newChannelMenuActions, siteModesPopoverActions, channelMenuActions, uiActions, status } from '../consts/commonConsts';

const showEditMenu = (sectionId, adId, position, variationId) => ({ type: editMenuActions.SHOW_EDIT_MENU, sectionId, adId, position, variationId }),
	hideEditMenu = () => ({ type: editMenuActions.HIDE_EDIT_MENU }),
	showInsertMenu = (payload) => ({ type: insertMenuActions.SHOW_MENU, payload }),
	hideInsertMenu = () => ({ type: insertMenuActions.HIDE_MENU }),
	showChannelMenu = (position) => ({ type: channelMenuActions.SHOW_CHANNEL_MENU, position }),
	hideChannelMenu = () => ({ type: channelMenuActions.HIDE_CHANNEL_MENU }),
	showNewChannelMenu = (position) => ({ type: newChannelMenuActions.SHOW_NEW_CHANNEL_MENU, position }),
	showSiteModesPopover = (position) => ({ type: siteModesPopoverActions.SHOW_SITE_MODES_POPOVER, position }),
	hideSiteModesPopover = () => ({ type: siteModesPopoverActions.HIDE_SITE_MODES_POPOVER }),
	resetErrors = sectionId => ({ type: uiActions.RESET_ERRORS, sectionId }),
	resetAfterSaveModal = () => ({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.RESET }),
	hideNewChannelInsertMenu = () => ({ type: newChannelMenuActions.HIDE_NEW_CHANNEL_MENU });

export { showEditMenu, showInsertMenu, hideEditMenu, hideInsertMenu,
	showNewChannelMenu, hideNewChannelInsertMenu, showSiteModesPopover,
	hideSiteModesPopover, showChannelMenu, hideChannelMenu, resetErrors, resetAfterSaveModal };
