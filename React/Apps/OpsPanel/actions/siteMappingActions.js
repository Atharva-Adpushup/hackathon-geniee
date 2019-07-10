import { siteMappingActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const fetchSites = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getAllSites',
		method: 'POST'
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: siteMappingActions.SET_SITES_DATA, data: response.sites });
	});
};

export { fetchSites };
