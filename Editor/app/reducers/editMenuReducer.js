import { editMenuActions, sectionActions } from 'consts/commonConsts';

const editMenu = (state = { isVisible: false }, action) => {
	switch (action.type) {
		case editMenuActions.SHOW_EDIT_MENU:
			return { isVisible: true, sectionId: action.sectionId, adId: action.adId, position: action.position };

		case editMenuActions.HIDE_EDIT_MENU:
			return { isVisible: false };

		default:
			return state;
	}
};

export default editMenu;
