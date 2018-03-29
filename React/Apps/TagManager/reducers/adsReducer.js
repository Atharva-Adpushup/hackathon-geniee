import { adActions } from '../configs/commonConsts';

const ads = (state = [], action) => {
	switch (action.type) {
		case adActions.UPDATE_ADS_LIST:
			return state.concat(action.data);

		default:
			return state;
	}
};

export default ads;
