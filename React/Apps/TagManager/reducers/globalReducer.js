import { globalActions } from '../configs/commonConsts';

const global = (state = { currentAd: null }, action) => {
	switch (action.type) {
		case globalActions.SET_CURRENT_AD:
			return { ...state, currentAd: action.currentAd };

		default:
			return state;
	}
};

export default global;
