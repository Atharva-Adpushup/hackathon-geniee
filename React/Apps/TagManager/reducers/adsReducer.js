import { adActions } from '../configs/commonConsts';

const ads = (state = [], action) => {
	switch (action.type) {
		case adActions.UPDATE_ADS_LIST:
			return state.concat(action.data);

		case adActions.REPLACE_ADS_LIST:
			return action.data;

		case adActions.UPDATE_AD:
			return state.map(ad => {
				if (action.data.id == ad.id) {
					return { ...ad, ...action.data.updateThis };
				}
				return ad;
			});

		default:
			return state;
	}
};

export default ads;
