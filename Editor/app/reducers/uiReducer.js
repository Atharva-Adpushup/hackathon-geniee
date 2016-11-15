import { combineReducers } from 'redux';
import { editMenuActions, insertMenuActions, sectionActions, siteModesPopoverActions,
	adActions, newChannelMenuActions, channelActions, channelMenuActions } from '../consts/commonConsts';

const insertMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case insertMenuActions.SHOW_MENU:
				const payload = action.payload;
				return {
					isVisible: true,
					xpath: payload.xpath,
					insertOptions: payload.insertOptions,
					parents: payload.parents,
					position: payload.position
				};

			case insertMenuActions.HIDE_MENU:
			case sectionActions.CREATE_SECTION:
				return { isVisible: false };

			default:
				return state;
		}
	},
	editMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case editMenuActions.SHOW_EDIT_MENU:
				return { isVisible: true, sectionId: action.sectionId, variationId: action.variationId, adId: action.adId, position: action.position };

			case editMenuActions.HIDE_EDIT_MENU:
			case adActions.DELETE_AD:
			case adActions.UPDATE_ADCODE:
			case adActions.UPDATE_CSS:
			case sectionActions.DELETE_SECTION:
				return { isVisible: false };

			default:
				return state;
		}
	},
	newChannelMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case newChannelMenuActions.SHOW_NEW_CHANNEL_MENU:
				return { isVisible: true, position: action.position };

			case channelMenuActions.SHOW_CHANNEL_MENU:
			case newChannelMenuActions.HIDE_NEW_CHANNEL_MENU:
			case channelActions.OPEN_CHANNEL:
				return { isVisible: false };

			default:
				return state;
		}
	},
	channelMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case channelMenuActions.SHOW_CHANNEL_MENU:
				return { isVisible: true, position: action.position };

			case channelMenuActions.HIDE_CHANNEL_MENU:
			case channelActions.OPEN_CHANNEL:
			case channelActions.SAVE_SAMPLE_URL:
			case channelActions.CLOSE_CHANNEL:
			case newChannelMenuActions.SHOW_NEW_CHANNEL_MENU:
				return { isVisible: false };

			default:
				return state;
		}
	},
	siteModesPopover = (state = { isVisible: false, position: { left: 0, top: 0 } }, action) => {
		switch (action.type) {
			case siteModesPopoverActions.SHOW_SITE_MODES_POPOVER:
				return {
					isVisible: true,
					position: action.position
				};
			case siteModesPopoverActions.HIDE_SITE_MODES_POPOVER:
				return { isVisible: false, position: { left: 0, top: 0 } };

			default:
				return state;
		}
	};

export default combineReducers({
	insertMenu, editMenu, newChannelMenu,
	siteModesPopover, channelMenu
});

