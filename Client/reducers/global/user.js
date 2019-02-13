import { USER_ACTIONS } from '../../constants/global';

const user = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case USER_ACTIONS.REPLACE_USER_DATA:
			return { fetched: true, data: action.data };
		default:
			return state;
	}
};

export default user;
