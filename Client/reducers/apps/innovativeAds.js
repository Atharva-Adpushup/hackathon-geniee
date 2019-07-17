/* eslint-disable no-case-declarations */
import { combineReducers } from 'redux';
import { AD_ACTIONS, GLOBAL_ACTIONS } from '../../constants/innovativeAds';

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

const global = (state = {}, action) => {
	const siteData = action.siteId && state[action.siteId] ? state[action.siteId] : {};
	const { meta = { fetched: false, content: {} } } = siteData;
	switch (action.type) {
		case GLOBAL_ACTIONS.SET_CURRENT_AD:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					currentAd: action.currentAd
				}
			};

		case GLOBAL_ACTIONS.REPLACE_META:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					meta: { fetched: true, content: action.data }
				}
			};

		case GLOBAL_ACTIONS.SET_CHANNELS:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					channels: action.data
				}
			};

		case GLOBAL_ACTIONS.SET_META:
			return { ...state, meta: { ...state.meta, ...action.meta } };

		case GLOBAL_ACTIONS.UPDATE_AD_TRACKING_LOGS:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					meta: {
						...meta,
						content: {
							...meta.content,
							[action.value.mode]: [...meta.content[action.value.mode], ...action.value.logs]
						}
					}
				}
			};

		case GLOBAL_ACTIONS.SET_AD_TRACKING_LOGS:
			return {
				...state,
				[action.siteId]: {
					...siteData,
					meta: {
						...meta,
						content: {
							...meta.content,
							[action.value.mode]: action.value.logs
						}
					}
				}
			};

		default:
			return state;
	}
};

export default combineReducers({ ads, global });
