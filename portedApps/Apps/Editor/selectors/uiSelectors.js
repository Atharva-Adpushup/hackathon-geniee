const getInsertMenuState = state => state.ui.insertMenu,
	getEditMenuState = state => state.ui.editMenu,
	getNewChannelMenuState = state => state.ui.newChannelMenu,
	getChannelMenuState = state => state.ui.channelMenu,
	getSiteModesPopoverPosition = state => state.ui.siteModesPopover.position,
	getAfterSaveLoaderState = state => state.ui.afterSaveLoader,
	getSiteModesPopoverVisibility = state => state.ui.siteModesPopover.isVisible;

export {
	getInsertMenuState,
	getEditMenuState,
	getAfterSaveLoaderState,
	getNewChannelMenuState,
	getSiteModesPopoverPosition,
	getChannelMenuState,
	getSiteModesPopoverVisibility
};
