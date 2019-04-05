import { USER_ACTIONS, SITE_ACTIONS } from '../../constants/global';

const user = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case USER_ACTIONS.REPLACE_USER_DATA:
			return { fetched: true, data: { ...state.data, ...action.data } };
		case SITE_ACTIONS.UPDATE_SITE_DATA: {
			const site = { ...action.data };
			site.domain = site.siteDomain;
			delete site.siteDomain;

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
			site.domain = site.siteDomain;
			delete site.siteDomain;

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
		default:
			return state;
	}
};

export default user;
