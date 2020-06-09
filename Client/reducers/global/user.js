import { USER_ACTIONS, SITE_ACTIONS } from '../../constants/global';

const user = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case USER_ACTIONS.REPLACE_USER_DATA:
			// copy the value of `showUniqueImpressionsReporting`
			// client can change its value temp and it should not affect the flag
			// in the ops panel. Ops panel will use `showUniqueImpressionsReporting`
			// and client side reporting will use its copy - `isUniqueImpEnabled`
			if(action.data && action.data.showUniqueImpressionsReporting) {
				action.data.isUniqueImpEnabled = action.data.showUniqueImpressionsReporting || false
			}
			return { fetched: true, data: { ...state.data, ...action.data } };
		case SITE_ACTIONS.UPDATE_SITE_DATA: {
			const site = { ...action.data };

			if (site.siteDomain) {
				site.domain = site.siteDomain;
				delete site.siteDomain;
			}

			return {
				...state,
				data: {
					...state.data,
					sites: {
						...state.data.sites,
						[site.siteId]: {
							...state.data.sites[site.siteId],
							...site
						}
					}
				}
			};
		}
		case SITE_ACTIONS.UPDATE_SITE_STEP: {
			const site = { ...action.data };

			return {
				...state,
				data: {
					...state.data,
					sites: {
						...state.data.sites,
						[site.siteId]: {
							...state.data.sites[site.siteId],
							...site
						}
					}
				}
			};
		}

		case USER_ACTIONS.UPDATE_AD_NETWORK_SETTINGS: {
			return {
				...state,
				data: {
					...state.data,
					adNetworkSettings: action.data
				}
			};
		}
		case USER_ACTIONS.UPDATE_USER: {
			return {
				...state,
				data: {
					...state.data,
					[action.data.key]: action.data.value
				}
			};
		}
		case USER_ACTIONS.OVERRIDE_OPS_PANEL_VALUE: {
			// temp change value for client only
			return {
				...state,
				data: {
					...state.data,
					isUniqueImpEnabled: action.data.isUniqueImpEnabled
				}
			};
		}
		default:
			return state;
	}
};

export default user;
