import { insertMenuActions, sectionActions } from 'consts/commonConsts';

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
};

export default insertMenu;
