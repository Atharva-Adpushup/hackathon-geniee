import { combineReducers } from 'redux';
import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../constants/innovativeAds';

const ads = (state = { fetched: false, content: [] }, action) => {
	switch (action.type) {
		case AD_ACTIONS.UPDATE_ADS_LIST:
			return { ...state, content: state.content.concat(action.data) };

		case AD_ACTIONS.REPLACE_ADS_LIST:
			return { fetched: true, content: action.data };

		case AD_ACTIONS.UPDATE_AD:
			return {
				...state,
				content: state.content.map(ad => {
					if (action.data.id === ad.id) {
						return { ...ad, ...action.data.updateThis };
					}
					return ad;
				})
			};

		default:
			return state;
	}
};

const global = (
	state = { currentAd: null, meta: { fetched: false, content: {} }, channels: [] },
	action
) => {
	switch (action.type) {
		case GLOBAL_ACTIONS.SET_CURRENT_AD:
			return { ...state, currentAd: action.currentAd };

		case GLOBAL_ACTIONS.REPLACE_META:
			return { ...state, meta: { fetched: true, content: action.data } };

		case GLOBAL_ACTIONS.SET_CHANNELS:
			return { ...state, channels: [...state.channels, ...action.data] };

		case GLOBAL_ACTIONS.SET_META:
			return { ...state, meta: { ...state.meta, ...action.meta } };

		case GLOBAL_ACTIONS.UPDATE_AD_TRACKING_LOGS:
			return {
				...state,
				meta: {
					...state.meta,
					content: {
						...state.meta.content,
						[action.value.mode]: [...state.meta.content[action.value.mode], ...action.value.logs]
					}
				}
			};

		case GLOBAL_ACTIONS.SET_AD_TRACKING_LOGS:
			return {
				...state,
				meta: {
					...state.meta,
					content: {
						...state.meta.content,
						[action.value.mode]: action.value.logs
					}
				}
			};

		default:
			return state;
	}
};

export default combineReducers({ ads, global });
