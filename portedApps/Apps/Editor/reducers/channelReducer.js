import { channelActions, variationActions } from 'consts/commonConsts';
import { immutableArrayDelete } from 'libs/immutableHelpers';

const initialState = { activeChannel: null, byIds: {} },
	channel = (state = {}, action) => {
		let index;
		switch (action.type) {
			case channelActions.CREATE_CHANNEL:
				const config = action.payload;
				return {
					id: config.id,
					channelName: config.channelName,
					siteDomain: window.ADP_SITE_DOMAIN,
					platform: config.platform,
					pageGroup: config.pageGroup,
					sampleUrl: config.sampleUrl,
					createTs: config.createTs,
					contentSelector: config.contentSelector,
					variations: config.variations,
					activeVariation: null,
					contentSelectorMissing: false,
					isLoading: true,
					isOpen: true
				};

			case channelActions.SAVE_SAMPLE_URL:
				return { ...state, sampleUrl: action.sampleUrl };

			case channelActions.UPDATE_AUTOPTIMIZE:
				return { ...state, autoOptimise: action.value };

			case channelActions.CHANGE_CONTENT_SELECTOR:
				return { ...state, contentSelector: action.selector };

			case variationActions.ADD_VARIATION:
			case variationActions.COPY_VARIATION:
				return {
					...state,
					activeVariation: action.variationId,
					variations: [...state.variations, action.variationId]
				};

			case variationActions.DELETE_VARIATION:
				index = state.variations.indexOf(action.variationId);
				if (index === -1) {
					return state;
				}
				if (action.variationId === state.activeVariation) {
					const nextActiveIndex = state.variations[index + 1] ? index + 1 : index - 1;
					return {
						...state,
						activeVariation: state.variations[nextActiveIndex],
						variations: immutableArrayDelete(state.variations, index)
					};
				}
				return { ...state, variations: immutableArrayDelete(state.variations, index) };

			case variationActions.SET_ACTIVE_VARIATION:
				return { ...state, activeVariation: action.variationId };

			case channelActions.OPEN_CHANNEL_SUCCESS:
				return { ...state, isLoading: false };

			case channelActions.CLOSE_CHANNEL:
				return { ...state, isOpen: false };

			case channelActions.OPEN_CHANNEL:
				return { ...state, isLoading: true, isOpen: true };

			case channelActions.CONTENT_SELECTOR_MISSING:
				return { ...state, contentSelectorMissing: true };

			case channelActions.CONTENT_SELECTOR_WORKED:
				return { ...state, contentSelectorMissing: false };

			default:
				return state;
		}
	},
	channelData = (state = initialState, action) => {
		switch (action.type) {
			case channelActions.CREATE_CHANNEL:
				return {
					...state,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(undefined, action)
					}
				};

			case channelActions.SET_ACTIVE_CHANNEL:
				return { ...state, activeChannel: action.channelId };

			case channelActions.SAVE_SAMPLE_URL:
			case channelActions.CHANGE_CONTENT_SELECTOR:
			case channelActions.OPEN_CHANNEL_SUCCESS:
			case variationActions.ADD_VARIATION:
			case variationActions.COPY_VARIATION:
			case channelActions.CONTENT_SELECTOR_MISSING:
			case channelActions.CONTENT_SELECTOR_WORKED:
			case variationActions.DELETE_VARIATION:
			case channelActions.UPDATE_AUTOPTIMIZE:
				return {
					...state,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(state.byIds[action.channelId], action)
					}
				};

			case channelActions.OPEN_CHANNEL:
				return {
					...state,
					activeChannel: action.channelId,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(state.byIds[action.channelId], action)
					}
				};

			case channelActions.CLOSE_CHANNEL:
				return {
					...state,
					activeChannel: action.activeChannelId,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(state.byIds[action.channelId], action)
					}
				};

			case variationActions.SET_ACTIVE_VARIATION:
				return {
					...state,
					byIds: {
						...state.byIds,
						[state.activeChannel]: channel(state.byIds[state.activeChannel], action)
					}
				};

			default:
				return state;
		}
	};

export default channelData;
