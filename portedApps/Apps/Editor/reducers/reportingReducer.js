import { reportingActions } from 'consts/commonConsts';

const reporting = (state = {}, action) => {
	switch (action.type) {
		case reportingActions.SET_REPORT:
			return {
				...state,
				sections: action.data.sections
			};
		default:
			return state;
	}
};

export default reporting;
