import { sectionActions, adActions } from 'consts/commonConsts';
import { immutableObjectDelete } from 'libs/immutableHelpers';

const adsByIds = (state = {}, action) => {
	switch (action.type) {
		case sectionActions.CREATE_SECTION:
		case adActions.CREATE_AD:
			const payload = action.adPayload ? action.adPayload : action.payload;
			return { ...state,
				[payload.id]: {
					id: payload.id,
					adCode: payload.adCode,
					css: payload.css,
					height: payload.height,
					width: payload.width,
				},
			};

		case adActions.DELETE_AD:
			return immutableObjectDelete(state, 'id', action.adId);

		case sectionActions.UPDATE_ADCODE:
			return { ...state, [action.adId]: { ...state[action.adId], adCode: action.adCode } };

		case sectionActions.UPDATE_CSS:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.css } };


		default:
			return state;
	}
};

export default adsByIds;
