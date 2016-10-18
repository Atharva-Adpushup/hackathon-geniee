import { sectionActions, adActions, variationActions } from 'consts/commonConsts';
import { immutableObjectDelete } from 'libs/immutableHelpers';
import _ from 'lodash';

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

		case adActions.UPDATE_ADCODE:
			return { ...state, [action.adId]: { ...state[action.adId], adCode: action.adCode } };

		case adActions.UPDATE_CSS:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.css } };

		case variationActions.COPY_VARIATION:
			const ads = {};
			_.each(action.ads, (section) => (ads[section.id] = section));
			return { ...state, ...ads };

		default:
			return state;
	}
};

export default adsByIds;
