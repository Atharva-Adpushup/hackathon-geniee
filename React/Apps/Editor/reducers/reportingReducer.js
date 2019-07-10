import { reportingActions } from 'consts/commonConsts';

const reporting = (state = {}, action) => {
	switch (action.type) {
		case reportingActions.SET_REPORT:
			return {
				...state,
				pagegroups: action.data.pagegroups,
				variations: action.data.variations,
				sections: action.data.sections
			};
			break;
		default:
			return state;
			break;
	}
};

export default reporting;
