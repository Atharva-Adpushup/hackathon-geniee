import { uiActions, globalActions } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const masterSave = siteId => (dispatch, getState) => {
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
				alert('Some error occurred');
				return;
			}
			return alert('Save successful');
		});
	},
	resetCurrentAd = () => (dispatch, getState) => {
		dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: null });
		return true;
	};

export { masterSave, resetCurrentAd };
