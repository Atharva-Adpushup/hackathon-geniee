import { editMenuActions } from 'consts/commonConsts';

const showMenu = (sectionId, adId, position) => ({ type: editMenuActions.SHOW_EDIT_MENU, sectionId, adId, position }),
	hideMenu = () => ({ type: editMenuActions.HIDE_EDIT_MENU });

export { showMenu, hideMenu };
