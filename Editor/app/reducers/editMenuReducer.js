import { editMenuActions, sectionActions, adActions } from '../consts/commonConsts';

const editMenu = (state = { isVisible: false }, action) => {
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
};

export default editMenu;
