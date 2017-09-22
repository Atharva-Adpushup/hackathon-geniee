import { insertMenuActions } from 'consts/commonConsts';

const showMenu = payload => ({ type: insertMenuActions.SHOW_MENU, payload }),
	hideMenu = () => ({ type: insertMenuActions.HIDE_MENU });

export { showMenu, hideMenu };
