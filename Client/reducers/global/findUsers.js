import { USER_ACTIONS } from '../../constants/global';

const findUsers = (state = { data: [] }, action) => {
	switch (action.type) {
		case USER_ACTIONS.UPDATE_FIND_USER:
			return {
				...state,
				data: [...action.data]
			};

		default:
			return state;
	}
};

export default findUsers;
