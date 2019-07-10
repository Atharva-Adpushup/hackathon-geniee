import { adActions } from '../configs/commonConsts';

const ads = (state = { fetched: false, content: [] }, action) => {
	switch (action.type) {
		case adActions.UPDATE_ADS_LIST:
			return { ...state, content: state.content.concat(action.data) };

		case adActions.REPLACE_ADS_LIST:
			return { fetched: true, content: action.data };

		case adActions.UPDATE_AD:
			return {
				...state,
				content: state.content.map(ad => {
					if (action.data.id === ad.id) {
						return { ...ad, ...action.data.updateThis };
					}
					return ad;
				})
			};

		default:
			return state;
	}
};

export default ads;
