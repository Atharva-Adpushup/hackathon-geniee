import { variationActions, sectionActions } from 'consts/commonConsts';
import { immutableArrayDelete, immutablePush } from 'libs/immutableHelpers';
import _ from 'lodash';

const variation = (state = {}, action) => {
		switch (action.type) {
			case variationActions.ADD_VARIATION:
				const config = action.payload;
				return {
					id: config.id,
					name: config.name,
					trafficDistribution: config.trafficDistribution,
					createTs: config.createTs,
					customJs: config.customJs,
					status: config.status,
					sections: config.sections,
					expanded: false
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
			case sectionActions.CREATE_INCONTENT_SECTION:
				return {
					...state,
					[action.variationId]: {
						...state[action.variationId],
						sections: immutablePush(state[action.variationId].sections, action.sectionId)
					}
				};

			case sectionActions.DELETE_SECTION:
				const index = state[action.variationId].sections.indexOf(action.sectionId);

				if (index !== -1) {
					return {
						...state,
						[action.variationId]: {
							...state[action.variationId],
							sections: immutableArrayDelete(state[action.variationId].sections, index)
						}
					};
				}

				return state;

			case variationActions.SAVE_BEFORE_JS:
				alert('Before JS has been saved!');

				return {
					...state,
					[action.variation.id]: {
						...state[action.variation.id],
						customJs: {
							beforeAp: btoa(action.beforeJs),
							afterAp: action.variation.customJs.afterAp
						}
					}
				};

			case variationActions.SAVE_AFTER_JS:
				alert('After JS has been saved!');

				return {
					...state,
					[action.variation.id]: {
						...state[action.variation.id],
						customJs: {
							beforeAp: action.variation.customJs.beforeAp,
							afterAp: btoa(action.afterJs)
						}
					}
				};

			case variationActions.EDIT_VARIATION_NAME:
				return {
					...state,
					[action.variationId]: {
						...state[action.variationId],
						name: action.name
					}
				};

			case variationActions.EDIT_TRAFFIC_DISTRIBUTION:
				return {
					...state,
					[action.variationId]: {
						...state[action.variationId],
						trafficDistribution: parseInt(action.trafficDistribution, 10)
					}
				};

			case variationActions.DELETE_VARIATION:
				return _.omitBy(state, { id: action.variationId });

			case variationActions.COPY_VARIATION:
				return { ...state, [action.variationId]: action.variation };

			default:
				return state;
		}
	};

export default variationByIds;