
const getInsertMenuState = (state) => state.ui.insertMenu,
	getEditMenuState = (state) => state.ui.editMenu,
	getNewChannelMenuState = (state) => state.ui.newChannelMenu,
	getSiteModesPopoverPosition = (state) => state.ui.siteModesPopover.position,
	getSiteModesPopoverVisibility = (state) => state.ui.siteModesPopover.isVisible;

export { getInsertMenuState, getEditMenuState,
	getNewChannelMenuState, getSiteModesPopoverPosition, getSiteModesPopoverVisibility };

