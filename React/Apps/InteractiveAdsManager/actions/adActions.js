import { adActions, globalActions, API_PATHS } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';

const createAd = params => (dispatch, getState) =>
	ajax({
		url: API_PATHS.CREATE_AD,
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return alert('Ad creation failed');
		}
		dispatch({ type: adActions.UPDATE_ADS_LIST, data: { ...params.ad, id: response.data.id } });
		dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.id });

		const { ad } = params;
		let adsKeys = [];
		let mode;

		try {
			if (ad.pagegroups && ad.pagegroups.length) {
				adsKeys = ad.pagegroups.map(pg => `${ad.formatData.platform}-${ad.formatData.format}-${pg}`);
				mode = 'pagegroups';
			} else {
				adsKeys = `${ad.formatData.platform}-${ad.formatData.format}`;
				mode = 'custom';
			}
		} catch (e) {
			console.log(e);
		}
		dispatch({
			type: globalActions.UPDATE_AD_TRACKING_LOGS,
			value: {
				mode,
				logs: adsKeys
			}
		});
	});
const fetchAds = params => dispatch =>
	ajax({
		url: API_PATHS.FETCH_ADS,
		method: 'GET',
		data: params
	}).then(response => {
		if (response.error) {
			return alert('Ad fetching failed');
		}
		dispatch({ type: adActions.REPLACE_ADS_LIST, data: response.data.ads });
	});
const deleteAd = params => dispatch =>
	ajax({
		url: API_PATHS.DELETE_AD,
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return alert('Delete Ad failed');
		}
		dispatch({ type: adActions.DELETE_AD, adId: params.adId });
	});
const updateAd = (adId, data) => dispatch =>
	dispatch({
		type: adActions.UPDATE_AD,
		data: {
			id: adId,
			updateThis: data
		}
	});
const modifyAdOnServer = (adId, data) => dispatch =>
	ajax({
		url: API_PATHS.MODIFY_AD,
		method: 'POST',
		data: JSON.stringify({ siteId: window.siteId, adId, data })
	}).then(response => {
		if (response.error) {
			return alert(response.data.message);
		}
		return dispatch({
			type: adActions.UPDATE_AD,
			data: {
				id: adId,
				updateThis: data
			}
		});
	});
const archiveAd = (adId, data, isSuperUser) => (dispatch, getState) => {
	function processing(toUpdate, updatedLogs) {
		if (isSuperUser) {
			return Promise.resolve();
		}
		return ajax({
			url: API_PATHS.MODIFY_AD,
			method: 'POST',
			data: JSON.stringify({
				siteId: window.siteId,
				adId,
				data: toUpdate,
				metaUpdate: {
					mode: 'pagegroups',
					logs: updatedLogs
				}
			})
		}).then(response => {
			if (response.error) {
				return Promise.reject(response.data.message);
			}
			return true;
		});
	}

	const state = getState();
	const globalAdLogs = state.global.meta.pagegroups;
	const { format, platform, pagegroups, isActive, archivedOn } = data;
	const currentAdLogs = pagegroups.map(pg => `${platform}-${format}-${pg}`);
	const mode = 'pagegroups';

	let updatedLogs = null;

	if (isActive) {
		const alreadyExists = globalAdLogs.some(log => currentAdLogs.includes(log));
		if (alreadyExists) {
			return new Promise(resolve => {
				alert(
					`"${format.toUpperCase()} ad already exists for ${platform} and ${pagegroups
						.join(',')
						.toUpperCase()} "`
				);
				return resolve(false);
			});
		}
		updatedLogs = [...globalAdLogs, ...currentAdLogs];
	}
	if (!isActive && !updatedLogs) {
		updatedLogs = globalAdLogs.filter(log => !currentAdLogs.includes(log));
	}

	return processing({ isActive }, updatedLogs)
		.then(() => {
			dispatch({
				type: adActions.UPDATE_AD,
				data: {
					id: adId,
					updateThis: {
						isActive,
						archivedOn
					}
				}
			});
			dispatch({
				type: globalActions.SET_AD_TRACKING_LOGS,
				value: {
					mode,
					logs: updatedLogs
				}
			});
			return true;
		})
		.catch(err => {
			console.log(err);
			alert('Operation Failed. Please contact Ops');
			return false;
		});
};

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer, archiveAd };
