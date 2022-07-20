import { USER_ACTIONS } from '../../constants/global';

const associatedAccounts = (state = { data: [] }, action) => {
	switch (action.type) {
		case USER_ACTIONS.ASSOCIATED_ACCOUNTS:
			return {
				...state,
				data: [...action.data]
			};

		default:
			return state;
	}
};

export default associatedAccounts;
