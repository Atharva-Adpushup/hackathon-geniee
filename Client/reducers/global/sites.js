/* eslint-disable no-case-declarations */
import { SITE_ACTIONS } from '../../constants/global';

const sites = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case SITE_ACTIONS.REPLACE_SITE_DATA:
			return { fetched: true, data: action.data };

		case SITE_ACTIONS.UPDATE_SITE_DATA:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						...action.data
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_STEP:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						...action.data
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_APCONFIG:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						apConfigs: {
							...state.data[action.data.siteId].apConfigs,
							...action.data.apConfigs
						}
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						[action.data.key]: {
							...state.data[action.data.siteId][action.data.key],
							...action.data.value
						}
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_DATA_KEY_ARRAY:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						[action.data.key]: [
							...state.data[action.data.siteId][action.data.key],
							...action.data.value
						]
					}
				}
			};

		case SITE_ACTIONS.UPDATE_SITE_INVENTORIES:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						inventories: action.data.inventories
					}
				}
			};
		case SITE_ACTIONS.UPDATE_SITE_BLOCKLISTED_LINE_ITEMS:
			return {
				...state,
				data: {
					...state.data,
					[action.data.siteId]: {
						...state.data[action.data.siteId],
						blockListedLineItems: [...action.data.blockListedLineItems]
					}
				}
			};
		case SITE_ACTIONS.UPDATE_SITE_RULES_ENGINE_DATA: {
			const { payload: { siteId, rules } = {} } = action;
			const siteData = state.data[siteId];
			return {
				...state,
				data: {
					...state.data,
					[siteId]: {
						...siteData,
						apConfigs: {
							...siteData.apConfigs,
							rules
						}
					}
				}
			};
		}
		case SITE_ACTIONS.SET_UNSAVED_CHANGES: {
			const { hasUnsavedChanges } = action;
			if (hasUnsavedChanges === state.hasUnsavedChanges) return state;

			return {
				...state,
				hasUnsavedChanges
			};
		}
		default:
			return state;
	}
};

export default sites;
