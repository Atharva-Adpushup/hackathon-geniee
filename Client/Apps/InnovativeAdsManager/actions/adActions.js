import { adActions, globalActions, API_PATHS } from '../configs/commonConsts';
import { ajax } from '../../../common/helpers';
import { pagegroupFiltering } from '../lib/helpers';

const helpers = {
	makeAPICall: (adId, isSuperUser, toUpdate, updatedLogs) => {
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
	},
	processing: (
		adId,
		isSuperUser,
		toUpdate,
		updatedLogs,
		dispatch,
		mode = 'pagegroups',
		logType = globalActions.SET_AD_TRACKING_LOGS
	) =>
		helpers
			.makeAPICall(adId, isSuperUser, toUpdate, updatedLogs)
			.then(() => {
				dispatch({
					type: adActions.UPDATE_AD,
					data: {
						id: adId,
						updateThis: toUpdate
					}
				});
				dispatch({
					type: logType,
					value: {
						mode,
						logs: updatedLogs
					}
				});
				return true;
			})
			.catch(err => {
				console.log(err);
				window.alert('Operation Failed. Please contact Ops');
				return false;
			})
};

const createAd = params => dispatch =>
	ajax({
		url: API_PATHS.CREATE_AD,
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return window.alert('Ad creation failed');
		}
		dispatch({ type: adActions.UPDATE_ADS_LIST, data: response.data.ads });
		dispatch({ type: globalActions.SET_CURRENT_AD, currentAd: response.data.ads[0].id });
		return dispatch({
			type: globalActions.UPDATE_AD_TRACKING_LOGS,
			value: {
				mode: 'pagegroups',
				logs: response.data.logs
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
			return window.alert('Ad fetching failed');
		}
		return dispatch({ type: adActions.REPLACE_ADS_LIST, data: response.data.ads });
	});
const deleteAd = params => dispatch =>
	ajax({
		url: API_PATHS.DELETE_AD,
		method: 'POST',
		data: JSON.stringify(params)
	}).then(response => {
		if (response.error) {
			return window.alert('Delete Ad failed');
		}
		return dispatch({ type: adActions.DELETE_AD, adId: params.adId });
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
			return window.alert(response.data.message);
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
	const state = getState();
	const globalAdLogs = state.global.meta.pagegroups;
	const { format, platform, pagegroups, isActive, archivedOn, networkData } = data;
	const currentAdLogs = pagegroups.map(pg => `${platform}-${format}-${pg}`);
	const mode = 'pagegroups';

	let updatedLogs = null;

	if (isActive) {
		const alreadyExists = globalAdLogs.some(log => currentAdLogs.includes(log));
		if (alreadyExists) {
			window.alert(
				`${format.toUpperCase()} ad already exists for ${platform.toUpperCase()} and ${pagegroups
					.join(',')
					.toUpperCase()}`
			);
			return Promise.resolve(false);
		}
		const { disabled } = pagegroupFiltering(
			window.iam.channels,
			platform,
			format,
			state.global.meta,
			false,
			pagegroups
		);

		if (disabled.size) {
			const currentPagegroupsDisabled = [...disabled].some(ele => pagegroups.includes(ele));
			if (currentPagegroupsDisabled) {
				window.alert('Only one type of horizontal / vertical ad is allowed in a pagegroup');
				return Promise.resolve(false);
			}
		}

		updatedLogs = [...globalAdLogs, ...currentAdLogs];
	}
	if (!isActive && !updatedLogs) {
		updatedLogs = globalAdLogs.filter(log => !currentAdLogs.includes(log));
	}

	return helpers.processing(adId, isSuperUser, { isActive, archivedOn, networkData }, updatedLogs, dispatch, mode);
};
const updateTraffic = (adId, { networkData, pagegroups, platform, format }, isSuperUser) => (dispatch, getState) => {
	const currentAdLogs = pagegroups.map(pg => `${platform}-${format}-${pg}`);
	const globalAdLogs = getState().global.meta.pagegroups;
	const currentAd = getState().ads.content.filter(ad => ad.id === adId)[0];
	const currentPagegroups = currentAd.pagegroups;
	const toRemove = currentPagegroups.map(
		pg => `${currentAd.formatData.platform}-${currentAd.formatData.format}-${pg}`
	);

	const filteredLogs = globalAdLogs.filter(log => !toRemove.includes(log));
	const updatedLogs = new Set(currentAdLogs.concat(filteredLogs));

	const mode = 'pagegroups';

	return helpers.processing(adId, isSuperUser, { pagegroups, networkData }, [...updatedLogs], dispatch, mode);
};

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer, archiveAd, updateTraffic };
