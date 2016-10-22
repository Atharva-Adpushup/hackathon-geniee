import { combineReducers } from 'redux';
import { editMenuActions, insertMenuActions, sectionActions, adActions, newChannelMenuActions, channelActions } from '../consts/commonConsts';

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
				return { isVisible: true, sectionId: action.sectionId, adId: action.adId, position: action.position };

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

			case newChannelMenuActions.HIDE_NEW_CHANNEL_MENU:
			case channelActions.OPEN_CHANNEL:
				return { isVisible: false };

			default:
				return state;
		}
	};

export default combineReducers({
	insertMenu,
	editMenu,
	newChannelMenu
});

