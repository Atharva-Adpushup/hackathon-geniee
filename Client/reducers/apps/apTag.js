import { combineReducers } from 'redux';
import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../constants/apTag';

const ads = (state = {}, action) => {
	const content =
		action.siteId && state[action.siteId] && state[action.siteId].content
			? state[action.siteId].content
			: [];
	switch (action.type) {
		case AD_ACTIONS.UPDATE_ADS_LIST:
			return {
				...state,
				[action.siteId]: {
					...state[action.siteId],
					content: content.concat(action.data)
				}
			};

		case AD_ACTIONS.REPLACE_ADS_LIST:
			return {
				...state,
				[action.siteId]: {
					...state[action.siteId],
					fetched: true,
					content: action.data
				}
			};

		case AD_ACTIONS.UPDATE_AD:
			return {
				...state,
				[action.siteId]: {
					...state[action.siteId],
					content: content.map(ad => {
						if (action.data.id === ad.id) {
							return { ...ad, ...action.data.updateThis };
						}
						return ad;
					})
				}
			};

		default:
			return state;
	}
};

const global = (state = { currentAd: null }, action) => {
	const siteData = action.siteId && state[action.siteId] ? state[action.siteId] : {};
	switch (action.type) {
		case GLOBAL_ACTIONS.SET_CURRENT_AD:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					currentAd: action.currentAd,
					maxHeight: action.maxHeight
				}
			};

		default:
			return state;
	}
};

export default combineReducers({ ads, global });
