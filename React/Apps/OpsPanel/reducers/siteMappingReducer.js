import { siteMappingActions } from '../configs/commonConsts';

const sites = (state = [], action) => {
	switch (action.type) {
		case siteMappingActions.SET_SITES_DATA:
			return [...state, ...action.data];
			break;

		default:
			return state;
	}
};

export default sites;
