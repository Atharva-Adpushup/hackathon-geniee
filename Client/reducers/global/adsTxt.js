import { ADS_TXT_ACTIONS } from '../../constants/global';

const adsTxt = (state = { fetched: false, data: {} }, action) => {
	switch (action.type) {
		case ADS_TXT_ACTIONS.REPLACE_ADS_TXT:
			return { fetched: true, data: action.data };
		default:
			return state;
	}
};

export default adsTxt;
