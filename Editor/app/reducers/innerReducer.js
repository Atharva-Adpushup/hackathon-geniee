import { combineReducers } from 'redux';
import { hbBoxActions, innerVariationActions, innerActions } from '../consts/commonConsts';

const hbBoxInitState = { BOTTOM: 0, TOP: 0, LEFT: 0, RIGHT: 0 },
	hbBox = (state = hbBoxInitState, action) => {
		switch (action.type) {
			case hbBoxActions.SHOW_HB_BOX:
				return {
					BOTTOM: action.payload.BOTTOM,
					TOP: action.payload.TOP,
					LEFT: action.payload.LEFT,
					RIGHT: action.payload.RIGHT,
				};

			case hbBoxActions.HIDE_HB_BOX:
				return hbBoxInitState;

			default:
				return state;
		}
	},
	variation = (state = { id: null, sections: [] }, action) => {
		switch (action.type) {
			case innerVariationActions.UPDATE_VARIATION:
				return action.variation;

			default:
				return state;
		}
	},
	adpElement = (state = { xpath: null, parents: [], insertOptions: [], position: {} }, action) => {
		switch (action.type) {
			case innerActions.SET_ADP_ELEMENT:
				return action.payload;

			default:
				return state;
		}
	};

export default combineReducers({ hbBox, variation, adpElement });

