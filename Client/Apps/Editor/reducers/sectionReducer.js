import { sectionActions, adActions, variationActions, messengerCommands, uiActions } from 'consts/commonConsts';
import { immutableObjectDelete, immutableArrayDelete, immutablePush } from 'libs/immutableHelpers';
import _ from 'lodash';

const sectionByIds = (state = {}, action) => {
	let payload;
	switch (action.type) {
		case sectionActions.CREATE_SECTION:
			payload = action.sectionPayload;
			return {
				...state,
				[payload.id]: {
					id: payload.id,
					xpath: payload.xpath,
					operation: payload.operation,
					name: payload.name,
					allXpaths: payload.allXpaths,
					ads: payload.ads,
					formatData: payload.formatData,
					type: payload.type,
					partnerData: {
						position: payload.position,
						firstFold: payload.firstFold,
						asyncTag: payload.asyncTag,
						customZoneId: payload.customZoneId
					}
				}
			};

		case sectionActions.CREATE_INCONTENT_SECTION:
			payload = action.sectionPayload;
			return {
				...state,
				[payload.id]: {
					id: payload.id,
					name: payload.name,
					ads: payload.ads,
					isIncontent: true,
					float: payload.float,
					sectionNo: payload.sectionNo,
					minDistanceFromPrevAd: payload.minDistanceFromPrevAd,
					notNear: payload.notNear
					// partnerData: payload.partnerData
				}
			};

		case messengerCommands.SET_RELEVANT_XPATHS:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], allXpaths: action.allXpaths } };

		case messengerCommands.XPATH_SECTION_VALIDATED:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], error: !action.isValidXPath } };

		case messengerCommands.XPATH_VALIDATED:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], error: !action.isValidXPath } };

		case uiActions.RESET_ERRORS:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], error: false } };

		case adActions.CREATE_AD:
			return {
				...state,
				[action.sectionId]: {
					...state[action.sectionId],
					ads: immutablePush(state[action.sectionId].ads, action.payload.id)
				}
			};

		case sectionActions.DELETE_SECTION:
			return immutableObjectDelete(state, 'id', action.sectionId);

		case sectionActions.UPDATE_PARTNER_DATA:
			alert('Settings have been saved!');
			return { ...state, [action.sectionId]: { ...state[action.sectionId], partnerData: action.partnerData } };

		case sectionActions.RENAME_SECTION:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], name: action.name } };

		case sectionActions.UPDATE_XPATH:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], xpath: action.xpath, allXpaths: [], error: false }
			};

		case sectionActions.UPDATE_OPERATION:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], operation: action.operation }
			};

		case sectionActions.UPDATE_INCONTENT_MIN_DISTANCE_FROM_PREV_AD:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], minDistanceFromPrevAd: action.minDistanceFromPrevAd }
			};

		case sectionActions.UPDATE_INCONTENT_NOT_NEAR:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], notNear: action.notNear }
			};

		case sectionActions.UPDATE_TYPE:
			return {
				...state,
				[action.sectionId]: {
					...state[action.sectionId],
					type: action.value,
					formatData:
						action.type != state[action.sectionId].type
							? {}
							: !state[action.sectionId].formatData
							? {}
							: state[action.sectionId].formatData
				}
			};

		case sectionActions.UPDATE_FORMAT_DATA:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], formatData: action.formatData }
			};

		case sectionActions.UPDATE_SECTION:
			return {
				...state,
				[action.sectionId]: { ...state[action.sectionId], ...action.params }
			};

		case sectionActions.UPDATE_INCONTENT_FLOAT:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], float: action.float } };

		case adActions.DELETE_AD:
			const index = state[action.sectionId].ads.indexOf(action.adId);
			if (index !== -1) {
				return {
					...state,
					[action.sectionId]: {
						...state[action.sectionId],
						ads: immutableArrayDelete(state[action.sectionId].ads, index)
					}
				};
			}
			return state;

		case variationActions.COPY_VARIATION:
			const sections = {};
			_.each(action.sections, section => (sections[section.id] = section));
			return { ...state, ...sections };

		case sectionActions.ENABLE_LAZYLOAD:
			return {
				...state,
				[action.sectionId]: {
					...state[action.sectionId],
					enableLazyLoading: action.value
				}
			};

		default:
			return state;
	}
};

export default sectionByIds;
