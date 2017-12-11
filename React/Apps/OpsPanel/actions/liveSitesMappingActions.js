import { liveSitesMappingActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const fetchLiveSites = params => (dispatch, getState) => {
	return ajax({
		url: '/ops/getLiveSites',
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			alert('Error occured. Please try again later');
		}
		return dispatch({ type: liveSitesMappingActions.SET_LIVE_SITES_DATA, data: response.data });
	});
};

export { fetchLiveSites };
