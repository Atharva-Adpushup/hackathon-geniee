import { globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const masterSave = siteId => (_, getState) => {
	const data = { siteId, ads: getState().ads.content };
	return ajax({
		url: '/tagManager/masterSave',
		method: 'POST',
		data: JSON.stringify({
			...data,
			siteDomain: window.currentUser.sites.filter(site => site.siteId === siteId)[0].domain
		})
	}).then(response => {
		if (response.error) {
			return alert('Some error occurred');
		}
		return alert('Save successful');
	});
};

const resetCurrentAd = () => dispatch => {
	dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: null });
	return true;
};

export { masterSave, resetCurrentAd };
