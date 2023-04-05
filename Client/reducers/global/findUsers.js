import { USER_ACTIONS } from '../../constants/global';

const findUsers = (state = { isFetching: false, data: [] }, action) => {
	switch (action.type) {
		case USER_ACTIONS.UPDATE_FIND_USER:
			return {
				...state,
				...{
					isFetching: false,
					fetched: true,
					data: [...action.data]
				}
			};
		case USER_ACTIONS.FETCHING_FIND_USER:
			return {
				...state,
				...{
					isFetching: true,
					fetched: false
				}
			};

		default:
			return state;
	}
};

export default findUsers;
