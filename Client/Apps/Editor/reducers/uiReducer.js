import { combineReducers } from 'redux';
import { manipulateElement } from 'scripts/domManager';
import {
	editMenuActions,
	insertMenuActions,
	sectionActions,
	siteModesPopoverActions,
	variationActions,
	adActions,
	newChannelMenuActions,
	channelActions,
	channelMenuActions,
	messengerCommands,
	uiActions,
	uiModes
} from '../consts/commonConsts';

const errorsConfig = {},
	insertMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case insertMenuActions.SHOW_MENU:
				const payload = action.payload;
				return {
					isVisible: true,
					xpath: payload.xpath,
					insertOptions: payload.insertOptions,
					parents: payload.parents,
					position: payload.position,
					firstFold: payload.firstFold
				};

			case insertMenuActions.HIDE_MENU:
			case sectionActions.CREATE_SECTION:
			case variationActions.OPEN_VARIATION_PANEL:
				return { isVisible: false };

			default:
				return state;
		}
	},
	editMenu = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case editMenuActions.SHOW_EDIT_MENU:
				return {
					isVisible: true,
					sectionId: action.sectionId,
					variationId: action.variationId,
					adId: action.adId,
					position: action.position
				};

			case editMenuActions.HIDE_EDIT_MENU:
			case adActions.DELETE_AD:
			case adActions.UPDATE_ADCODE:
			case adActions.UPDATE_CSS:
			case adActions.UPDATE_NETWORK:
			case sectionActions.DELETE_SECTION:
			case variationActions.OPEN_VARIATION_PANEL:
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
			case variationActions.OPEN_VARIATION_PANEL:
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
			case variationActions.OPEN_VARIATION_PANEL:
				return { isVisible: false };

			default:
				return state;
		}
	},
	errors = (
		state = {
			xpath: { error: false }
		},
		action
	) => {
		switch (action.type) {
			case messengerCommands.XPATH_VALIDATED:
				if (action.isValidXPath) {
					return {
						xpath: {
							error: false
						}
					};
				}
				return { xpath: { error: true, message: 'Please enter a valid xpath' } };

			case sectionActions.UPDATE_XPATH:
			case uiActions.RESET_ERRORS:
				return { xpath: { error: false } };

			default:
				return state;
		}
	},
	afterSaveLoader = (state = { status: 0 }, action) => {
		switch (action.type) {
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				return { status: action.status, msg: action.msg };

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
			case uiActions.UPDATE_AFTER_SAVE_STATUS:
				return { isVisible: false, position: { left: 0, top: 0 } };

			default:
				return state;
		}
	},
	editorViewing = (state = { mode: uiModes.EDITOR_MODE }, { type, mode }) => {
		switch (type) {
			case uiActions.SET_MODE:
				return { ...state, mode: mode };
			default:
				return state;
		}
	},
	variationPanel = (state = { expanded: false, open: false }, action) => {
		switch (action.type) {
			case variationActions.EXPAND_VARIATION_PANEL:
				manipulateElement(action.panelCssSelector, 'expand', action.params);
				return { ...state, expanded: true };

			case variationActions.SHRINK_VARIATION_PANEL:
				manipulateElement(action.panelCssSelector, 'shrink', action.params);
				return { ...state, expanded: false };

			case variationActions.TOGGLE_VARIATION_PANEL:
				return { ...state, open: !state.open };

			case variationActions.OPEN_VARIATION_PANEL:
				return { ...state, open: true };

			case variationActions.CLOSE_VARIATION_PANEL:
				return { ...state, open: false, expanded: false };

			default:
				return state;
		}
	},
	notifications = (state = { isVisible: false }, action) => {
		switch (action.type) {
			case uiActions.SHOW_NOTIFICATION:
				return {
					...state,
					isVisible: true,
					title: action.title,
					message: action.message,
					mode: action.mode
				};

			case uiActions.HIDE_NOTIFICATION:
				return {
					...state,
					isVisible: false,
					title: '',
					message: '',
					mode: ''
				};

			default:
				return state;
		}
	};

export default combineReducers({
	insertMenu,
	editMenu,
	newChannelMenu,
	siteModesPopover,
	channelMenu,
	errors,
	afterSaveLoader,
	variationPanel,
	editorViewing,
	notifications
});
