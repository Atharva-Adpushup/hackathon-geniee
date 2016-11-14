import { editMenuActions, insertMenuActions, newChannelMenuActions, siteModesPopoverActions } from '../consts/commonConsts';

const showEditMenu = (sectionId, adId, position, variationId) => ({ type: editMenuActions.SHOW_EDIT_MENU, sectionId, adId, position, variationId }),
	hideEditMenu = () => ({ type: editMenuActions.HIDE_EDIT_MENU }),
	showInsertMenu = (payload) => ({ type: insertMenuActions.SHOW_MENU, payload }),
	hideInsertMenu = () => ({ type: insertMenuActions.HIDE_MENU }),
	showNewChannelMenu = (position) => ({ type: newChannelMenuActions.SHOW_NEW_CHANNEL_MENU, position }),
	showSiteModesPopover = (position) => ({ type: siteModesPopoverActions.SHOW_SITE_MODES_POPOVER, position }),
	hideSiteModesPopover = () => ({ type: siteModesPopoverActions.HIDE_SITE_MODES_POPOVER }),
	hideNewChannelInsertMenu = () => ({ type: newChannelMenuActions.HIDE_NEW_CHANNEL_MENU });

export { showEditMenu, showInsertMenu, hideEditMenu, hideInsertMenu,
	showNewChannelMenu, hideNewChannelInsertMenu, showSiteModesPopover, hideSiteModesPopover };
