import { AD_ACTIONS, GLOBAL_ACTIONS, API_PATHS } from '../../../constants/innovativeAds';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';
import { pagegroupFiltering } from '../../../Apps/InnovativeAds/lib/helpers';

const helpers = {
	makeAPICall: (adId, isSuperUser, toUpdate, updatedLogs) => {
		if (isSuperUser) {
			return Promise.resolve();
		}
		return axiosInstance
			.post(API_PATHS.MODIFY_AD, {
				siteId: window.siteId,
				adId,
				data: toUpdate,
				metaUpdate: {
					mode: 'pagegroups',
					logs: updatedLogs
				}
			})
			.then(response => {
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
		logType = GLOBAL_ACTIONS.SET_AD_TRACKING_LOGS
	) =>
		helpers
			.makeAPICall(adId, isSuperUser, toUpdate, updatedLogs)
			.then(() => {
				dispatch({
					type: AD_ACTIONS.UPDATE_AD,
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
			.catch(err => errorHandler(err, 'Operation Failed. Please contact AdPushup Operations Team'))
};

const createAd = params => dispatch =>
	axiosInstance
		.post(API_PATHS.CREATE_AD, params)
		.then(response => {
			const { data } = response.data;
			dispatch({ type: AD_ACTIONS.UPDATE_ADS_LIST, data: data.ads });
			dispatch({ type: GLOBAL_ACTIONS.SET_CURRENT_AD, currentAd: data.ads[0].id });
			return dispatch({
				type: GLOBAL_ACTIONS.UPDATE_AD_TRACKING_LOGS,
				value: {
					mode: 'pagegroups',
					logs: data.logs
				}
			});
		})
		.catch(err => errorHandler(err, 'Ad creation failed'));
const fetchAds = params => dispatch =>
	axiosInstance
		.get(API_PATHS.FETCH_ADS, { params })
		.then(response => {
			const { data } = response.data;
			return dispatch({ type: AD_ACTIONS.REPLACE_ADS_LIST, data: data.ads });
		})
		.catch(err => errorHandler(err, 'Ad Fetching Failed'));
const deleteAd = params => dispatch =>
	axiosInstance.post(API_PATHS.DELETE_AD, params).then(response => {
		if (response.error) {
			return window.alert('Delete Ad failed');
		}
		return dispatch({ type: AD_ACTIONS.DELETE_AD, adId: params.adId });
	});
const updateAd = (adId, data) => dispatch =>
	dispatch({
		type: AD_ACTIONS.UPDATE_AD,
		data: {
			id: adId,
			updateThis: data
		}
	});
const modifyAdOnServer = (adId, data) => dispatch =>
	axiosInstance.post(API_PATHS.MODIFY_AD, { siteId: window.siteId, adId, data }).then(response => {
		if (response.error) {
			return window.alert(response.data.message);
		}
		return dispatch({
			type: AD_ACTIONS.UPDATE_AD,
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

	return helpers.processing(
		adId,
		isSuperUser,
		{ isActive, archivedOn, networkData },
		updatedLogs,
		dispatch,
		mode
	);
};
const updateTraffic = (adId, { networkData, pagegroups, platform, format }, isSuperUser) => (
	dispatch,
	getState
) => {
	const { innovativeAds } = getState().apps;
	const currentAdLogs = pagegroups.map(pg => `${platform}-${format}-${pg}`);
	const globalAdLogs = innovativeAds.global.meta.content.pagegroups;
	const currentAd = innovativeAds.ads.content.filter(ad => ad.id === adId)[0];
	const currentPagegroups = currentAd.pagegroups;
	const toRemove = currentPagegroups.map(
		pg => `${currentAd.formatData.platform}-${currentAd.formatData.format}-${pg}`
	);

	const filteredLogs = globalAdLogs.filter(log => !toRemove.includes(log));
	const updatedLogs = new Set(currentAdLogs.concat(filteredLogs));

	const mode = 'pagegroups';

	return helpers.processing(
		adId,
		isSuperUser,
		{ pagegroups, networkData },
		[...updatedLogs],
		dispatch,
		mode
	);
};

export { createAd, fetchAds, deleteAd, updateAd, modifyAdOnServer, archiveAd, updateTraffic };
