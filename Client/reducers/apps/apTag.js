import { combineReducers } from 'redux';
import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../constants/apTag';

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

const global = (state = { currentAd: null }, action) => {
	switch (action.type) {
		case GLOBAL_ACTIONS.SET_CURRENT_AD:
			return { ...state, currentAd: action.currentAd };

		default:
			return state;
	}
};

export default combineReducers({ ads, global });
