import { uiActions } from '../configs/commonConsts';
import { combineReducers } from 'redux';

const errors = (state = { adCreation: { value: false }, fetchAds: { value: false } }, action) => {
	switch (action.type) {
		case uiActions.SET_CREATE_AD_ERROR:
			return { ...state, adCreation: { value: action.value } };

		case uiActions.SET_FETCH_ADS_ERROR:
			return { ...state, fetchAds: { value: action.value } };

		default:
			return state;
	}
};

export default combineReducers({ errors });
