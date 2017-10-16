import { combineReducers } from 'redux';
import { hbBoxActions, innerVariationActions, innerActions, uiModes } from '../../consts/commonConsts';

const hbBoxInitState = { top: 0, left: 0, width: 0, height: 0 },
	hbBox = (state = hbBoxInitState, action) => {
		switch (action.type) {
			case hbBoxActions.SHOW_HB_BOX:
				return {
					top: action.payload.top,
					left: action.payload.left,
					width: action.payload.width,
					height: action.payload.height
				};

			case hbBoxActions.HIDE_HB_BOX:
				return hbBoxInitState;

			default:
				return state;
		}
	},
	editorViewing = (state = { mode: uiModes.EDITOR_MODE }, action) => {
		switch (action.type) {
			case innerActions.SET_MODE:
				return { ...state, mode: action.mode };
				break;

			default:
				return state;
		}
	},
	variation = (state = { id: null, channelId: null, sections: [] }, action) => {
		switch (action.type) {
			case innerVariationActions.UPDATE_VARIATION:
				return action.variation;

			default:
				return state;
		}
	},
	contentSelector = (state = { position: hbBoxInitState, selector: null }, action) => {
		switch (action.type) {
			case innerActions.UPDATE_CONTENT_OVERLAY:
				return action.payload;

			default:
				return state;
		}
	},
	adpElmInitState = { BOTTOM: 0, TOP: 0, LEFT: 0, RIGHT: 0 },
	elmSelector = (state = adpElmInitState, action) => {
		switch (action.type) {
			case innerActions.SET_ELEMENT_SELECTOR_CORDS:
				return action.payload;

			case innerActions.HIDE_ELEMENT_SELECTOR:
			case innerVariationActions.UPDATE_VARIATION:
				return adpElmInitState;

			default:
				return state;
		}
	};

export default combineReducers({ hbBox, variation, elmSelector, contentSelector, editorViewing });
