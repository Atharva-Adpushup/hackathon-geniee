import {
	editMenuActions,
	insertMenuActions,
	newChannelMenuActions,
	siteModesPopoverActions,
	channelMenuActions,
	uiActions,
	status,
	variationActions,
	proxy
} from '../consts/commonConsts';
import { getActiveChannelId } from 'selectors/channelSelectors';

const showEditMenu = (sectionId, adId, position, variationId) => ({
		type: editMenuActions.SHOW_EDIT_MENU,
		sectionId,
		adId,
		position,
		variationId
	}),
	hideEditMenu = () => ({ type: editMenuActions.HIDE_EDIT_MENU }),
	showInsertMenu = payload => ({ type: insertMenuActions.SHOW_MENU, payload }),
	hideInsertMenu = () => ({ type: insertMenuActions.HIDE_MENU }),
	showChannelMenu = position => ({ type: channelMenuActions.SHOW_CHANNEL_MENU, position }),
	hideChannelMenu = () => ({ type: channelMenuActions.HIDE_CHANNEL_MENU }),
	showNewChannelMenu = position => ({ type: newChannelMenuActions.SHOW_NEW_CHANNEL_MENU, position }),
	showSiteModesPopover = position => ({ type: siteModesPopoverActions.SHOW_SITE_MODES_POPOVER, position }),
	hideSiteModesPopover = () => ({ type: siteModesPopoverActions.HIDE_SITE_MODES_POPOVER }),
	resetErrors = sectionId => ({ type: uiActions.RESET_ERRORS, sectionId }),
	resetAfterSaveModal = () => ({ type: uiActions.UPDATE_AFTER_SAVE_STATUS, status: status.RESET }),
	hideNewChannelInsertMenu = () => ({ type: newChannelMenuActions.HIDE_NEW_CHANNEL_MENU }),
	toggleVariationPanel = () => ({ type: variationActions.TOGGLE_VARIATION_PANEL }),
	openVariationPanel = () => ({ type: variationActions.OPEN_VARIATION_PANEL }),
	closeVariationPanel = () => ({ type: variationActions.CLOSE_VARIATION_PANEL }),
	setMode = editorMode => (dispatch, getState) => {
		const activeChannelId = getActiveChannelId(getState());
		if (editorMode == '1') {
			chrome.runtime.sendMessage(
				proxy.EXTENSION_ID,
				{ cmd: uiActions.SET_MODE, data: { mode: editorMode, channelId: activeChannelId } },
				response => {}
			);
		}
		return dispatch({ type: uiActions.SET_MODE, mode: editorMode });
	},
	expandVariationPanel = (panelCssSelector, params) => ({
		type: variationActions.EXPAND_VARIATION_PANEL,
		panelCssSelector,
		params
	}),
	shrinkVariationPanel = (panelCssSelector, params) => ({
		type: variationActions.SHRINK_VARIATION_PANEL,
		panelCssSelector,
		params
	}),
	showNotification = params => ({
		type: uiActions.SHOW_NOTIFICATION,
		...params
	}),
	hideNotification = () => ({
		type: uiActions.HIDE_NOTIFICATION
	});

export {
	setMode,
	showEditMenu,
	showInsertMenu,
	hideEditMenu,
	hideInsertMenu,
	showNewChannelMenu,
	hideNewChannelInsertMenu,
	showSiteModesPopover,
	hideSiteModesPopover,
	showChannelMenu,
	hideChannelMenu,
	resetErrors,
	resetAfterSaveModal,
	expandVariationPanel,
	shrinkVariationPanel,
	toggleVariationPanel,
	openVariationPanel,
	closeVariationPanel,
	showNotification,
	hideNotification
};
