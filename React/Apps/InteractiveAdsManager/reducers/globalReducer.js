import { globalActions } from '../configs/commonConsts';

const global = (state = { currentAd: null, meta: { ...window.iam.meta } }, action) => {
	switch (action.type) {
		case globalActions.SET_CURRENT_AD:
			return { ...state, currentAd: action.currentAd };

		case globalActions.SET_META:
			return { ...state, meta: { ...state.meta, ...action.meta } };

		case globalActions.UPDATE_AD_TRACKING_LOGS:
			return {
				...state,
				meta: {
					...state.meta,
					[action.value.mode]: [...state.meta[action.value.mode], ...action.value.logs]
				}
			};

		case globalActions.SET_AD_TRACKING_LOGS:
			return {
				...state,
				meta: {
					...state.meta,
					[action.value.mode]: action.value.logs
				}
			};

		default:
			return state;
	}
};

export default global;
