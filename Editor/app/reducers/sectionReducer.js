import { sectionActions, adActions } from 'consts/commonConsts';
import { immutableObjectDelete, immutableArrayDelete, immutablePush } from 'libs/immutableHelpers';

const sectionByIds = (state = {}, action) => {
	switch (action.type) {
		case sectionActions.CREATE_SECTION:
			const payload = action.sectionPayload;
			return { ...state,
					[payload.id]: {
						id: payload.id,
						xpath: payload.xpath,
						operation: payload.operation,
						name: payload.name,
						allXpaths: payload.allXpaths,
						ads: payload.ads
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


		case sectionActions.RENAME_SECTION:
			return { ...state, [action.sectionId]: { ...state[action.sectionId], name: action.name } };

		case adActions.DELETE_AD:
			const index = state[action.sectionId].ads.indexOf(action.adId);
			if (index !== -1) {
				return { ...state, [action.sectionId]: { ...state[action.sectionId], ads: immutableArrayDelete(state[action.sectionId].ads, index) } };
			}
			return state;

		default:
			return state;
	}
};

export default sectionByIds;
