import { variationActions, sectionActions } from 'consts/commonConsts';
import { immutablePush } from 'libs/immutableHelpers';
import _ from 'lodash';

const variation = (state = {}, action) => {
		switch (action.type) {
			case variationActions.ADD_VARIATION:
				const config = action.payload;
				return {
					id: config.id,
					name: config.name,
					createTs: config.createTs,
					customJs: config.customJs,
					status: config.status,
					sections: config.sections
				};

			default:
				return state;
		}
	},
	variationByIds = (state = {}, action) => {
		switch (action.type) {
			case variationActions.ADD_VARIATION:
				return { ...state, [action.payload.id]: variation(undefined, action) };

			case sectionActions.CREATE_SECTION:
				return { ...state, [action.variationId]: {
					...state[action.variationId],
					sections: immutablePush(state[action.variationId].sections, action.sectionId)
				} };

			case variationActions.EDIT_VARIATION_NAME:
				return { ...state, [action.variationId]: {
					...state[action.variationId],
					name: action.name
				} };

			case variationActions.DELETE_VARIATION:
				return _.omitBy(state, { id: action.variationId });

			case variationActions.COPY_VARIATION:
				return { ...state, [action.variationId]: action.variation };

			default:
				return state;
		}
	};

export default variationByIds;
