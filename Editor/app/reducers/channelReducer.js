import { channelActions, variationActions } from 'consts/commonConsts';
import { immutableArrayDelete } from 'libs/immutableHelpers';

const chnl2 = {
	id: 'test2',
	channelName: 'TEST2',
	siteDomain: window.ADP_SITE_DOMAIN,
	platform: 'DESKTOP',
	pageGroup: 'POST',
	sampleUrl: 'http://www.articlemyriad.com/character-divine-influence-iliad-aeneid-role-gods-fate/',
	variations: [],
	isOpen: true,
	isLoading: true,
	activeVariation: null
};

const initialState = { activeChannel: 'test2', byIds: { test2: chnl2 } },
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
					isLoading: false,
					isOpen: false
				};

			case channelActions.EDIT_SAMPLE_URL:
				return { ...state, sampleUrl: action.sampleUrl };

			case channelActions.CHANGE_CONTENT_SELECTOR:
				return { ...state, contentSelector: action.selector };

			case variationActions.ADD_VARIATION:
			case variationActions.COPY_VARIATION:
				return { ...state, activeVariation: action.variationId, variations: [...state.variations, action.variationId] };

			case variationActions.DELETE_VARIATION:
				index = state.variations.indexOf(action.variationId);
				if (index === -1) {
					return state;
				}
				if (action.variationId === state.activeVariation) {
					const nextActiveIndex = state.variations[index + 1] ? index + 1 : index - 1;
					return { ...state, activeVariation: state.variations[nextActiveIndex], variations: immutableArrayDelete(state.variations, index) };
				}
				return { ...state, variations: immutableArrayDelete(state.variations, index) };

			case variationActions.SET_ACTIVE_VARIATION:
				return { ...state, activeVariation: action.variationId };

			case channelActions.OPEN_CHANNEL_SUCCESS:
				return { ...state, isLoading: false };

			default:
				return state;
		}
	},
	channelData = (state = initialState, action) => {
		switch (action.type) {
			case channelActions.CREATE_CHANNEL:
				return { ...state,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(undefined, action)
					} };

			case channelActions.SET_ACTIVE_CHANNEL:
				return { ...state, activeChannel: action.channelId };

			case channelActions.EDIT_SAMPLE_URL:
			case channelActions.CHANGE_CONTENT_SELECTOR:
			case channelActions.OPEN_CHANNEL_SUCCESS:
			case variationActions.ADD_VARIATION:
			case variationActions.COPY_VARIATION:
				return { ...state,
					byIds: {
						...state.byIds,
						[action.channelId]: channel(state.byIds[action.channelId], action)
					}
				};

			case variationActions.DELETE_VARIATION:
			case variationActions.SET_ACTIVE_VARIATION:
				return { ...state,
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
