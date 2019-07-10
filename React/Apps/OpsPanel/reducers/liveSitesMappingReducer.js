import { liveSitesMappingActions } from '../configs/commonConsts';

const liveSites = (state = [], action) => {
	switch (action.type) {
		case liveSitesMappingActions.SET_LIVE_SITES_DATA:
			return [...action.data];
			break;

		default:
			return state;
	}
};

export default liveSites;
