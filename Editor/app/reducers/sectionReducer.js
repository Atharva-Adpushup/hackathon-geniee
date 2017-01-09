import { sectionActions, adActions, variationActions } from 'consts/commonConsts';
import { immutableObjectDelete, immutableArrayDelete, immutablePush } from 'libs/immutableHelpers';
import _ from 'lodash';

const sectionByIds = (state = {}, action) => {
	let payload;
	switch (action.type) {
		case sectionActions.CREATE_SECTION:
			payload = action.sectionPayload;
			return { ...state,
					[payload.id]: {
						id: payload.id,
						xpath: payload.xpath,
						operation: payload.operation,
						name: payload.name,
						allXpaths: payload.allXpaths,
						ads: payload.ads,
						partnerData: {
							position: payload.position,
							firstFold: payload.firstFold,
							asyncTag: payload.asyncTag
						}
					}
				};

		case sectionActions.CREATE_INCONTENT_SECTION:
			payload = action.sectionPayload;
			return { ...state,
				[payload.id]: {
					id: payload.id,
					name: payload.name,
					ads: payload.ads,
					isIncontent: true,
					float: payload.float,
					sectionNo: payload.sectionNo,
					minDistanceFromPrevAd: payload.minDistanceFromPrevAd,
					notNear: payload.notNear
				}
			};

		case adActions.CREATE_AD:
			return { ...state,
				[action.sectionId]: {
					...state[action.sectionId],
					ads: immutablePush(state[action.sectionId].ads, action.payload.id)
				} };

		case sectionActions.DELETE_SECTION:
			return immutableObjectDelete(state, 'id', action.sectionId);

		case sectionActions.UPDATE_PARTNER_DATA:
			alert('Settings have been saved!');
			return { ...state, [action.sectionId]: { ...state[action.sectionId], partnerData: action.partnerData } };

		case sectionActions.RENAME_SECTION:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], name: action.name } };

		case sectionActions.UPDATE_XPATH:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], xpath: action.xpath } };

		case adActions.DELETE_AD:
			const index = state[action.sectionId].ads.indexOf(action.adId);
			if (index !== -1) {
				return { ...state, [action.sectionId]: { ...state[action.sectionId], ads: immutableArrayDelete(state[action.sectionId].ads, index) } };
			}
			return state;

		case variationActions.COPY_VARIATION:
			const sections = {};
			_.each(action.sections, (section) => (sections[section.id] = section));
			return { ...state, ...sections };

		default:
			return state;
	}
};

export default sectionByIds;
