// import { PAGEGROUP_ACTIONS } from '../../../constants/opsPanel';
import { SITE_ACTIONS, UI_ACTIONS } from '../../../constants/global';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler, getHtmlEncodedJSON } from '../../../helpers/commonFunctions';

const createChannels = (siteId, channels) => (dispatch, getState) =>
	axiosInstance
		.post('/channel/createChannels', { siteId, channels })
		.then(response => {
			const { data } = response.data;
			const { failed, successful } = data;
			const state = getState();
			const site = state.global.sites.data[siteId];
			const { cmsInfo } = site;

			if (successful && successful.channels.length) {
				const set = new Set();
				let { channelsInfo = {} } = cmsInfo;
				channelsInfo = {
					...channelsInfo,
					...successful.cmsInfo.channelsInfo
				};
				cmsInfo.pageGroups.forEach(pg => set.add(`${pg.sampleUrl}-break-${pg.pageGroup}`));
				successful.cmsInfo.pagegroups.forEach(pg => {
					set.add(`${pg.sampleUrl}-break-${pg.pageGroup}`);
				});
				const pgArray = Array.from(set);
				const updatedPagegroups = pgArray.map(sampleUrlWithPg => {
					const [sampleUrl, pageGroup] = sampleUrlWithPg.split('-break-');
					return {
						sampleUrl,
						pageGroup
					};
				});
				const updatedCMSInfo = {
					...cmsInfo,
					channelsInfo,
					pageGroups: updatedPagegroups
				};

				// Update Site Channels | This will appended to existing channels
				dispatch({
					type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_ARRAY,
					data: {
						siteId,
						key: 'channels',
						value: successful.channels
					}
				});
				// Update Site CMSInfo | This is will replace keys due to use of spread operator
				dispatch({
					type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
					data: {
						siteId,
						key: 'cmsInfo',
						value: updatedCMSInfo
					}
				});
				dispatch({
					type: UI_ACTIONS.SHOW_NOTIFICATION,
					mode: 'success',
					title: 'Operation Successful',
					autoDismiss: 5,
					message: `${successful.channels.join(', ')} Channel(s) creation successful.`
				});
			}
			if (failed && failed.channels.length) {
				const { details, channels: failedChannels } = failed;
				let message = 'Additional Details --- ';
				failedChannels.forEach(channel => {
					const current = details[channel];
					message += `<br />${current.device.toUpperCase()}:${current.pageGroupName} -- ${
						current.additionalData[0] ? current.additionalData[0].message : 'No error message found'
					}`;
				});
				dispatch({
					type: UI_ACTIONS.SHOW_NOTIFICATION,
					mode: 'error',
					title: 'Operation Failed',
					autoDismiss: 0,
					message: `${failedChannels.join(
						', '
					)} Channel(s) creation failed. Please try again. <br /><br />${message}`
				});
			}
			return {
				siteId,
				failed,
				successful
			};
		})
		.catch(err =>
			errorHandler(err, 'Pagegroup Creation Failed. Please contact AdPushup Operations/Tech Team')
		);

const fetchChannelsInfo = siteId => dispatch =>
	axiosInstance
		.get('/channel/fetchChannelsInfo', { params: { siteId } })
		.then(response => {
			const { data } = response.data;
			const { channels } = data;

			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: {
					siteId,
					key: 'cmsInfo',
					value: {
						channelsInfo: channels
					}
				}
			});
		})
		.catch(err =>
			errorHandler(
				err,
				'Pagegroups information fetching failed. Please contact AdPushup Operations/Tech Team'
			)
		);

const updatePagegroupPattern = (siteId, params) => (dispatch, getState) => {
	const {
		global: { sites }
	} = getState();
	const site = sites.data[siteId];
	let updatedPagegroupData = {
		pageGroup: params.pageGroup,
		pattern: params.pattern
	};
	updatedPagegroupData = getHtmlEncodedJSON(updatedPagegroupData);

	let { pageGroupPattern = {} } = site.apConfigs;
	let pagegroupsByDevice = pageGroupPattern[params.platform.toUpperCase()] || [];
	let found = false;

	pagegroupsByDevice = pagegroupsByDevice.map(pg => {
		if (pg.pageGroup === params.pageGroup) {
			found = true;
			return {
				...pg,
				...updatedPagegroupData
			};
		}
		return pg;
	});

	if (!found) pagegroupsByDevice.push(updatedPagegroupData);

	pageGroupPattern = {
		...pageGroupPattern,
		[params.platform.toUpperCase()]: pagegroupsByDevice
	};

	return axiosInstance
		.post('/site/saveSettings', { siteId, apConfigs: { pageGroupPattern } })
		.then(() => {
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: {
					siteId,
					key: 'apConfigs',
					value: {
						pageGroupPattern
					}
				}
			});
			dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: `Pagegroup Pattern Udpated`
			});
		})
		.catch(err => errorHandler(err, 'Pagegroup pattern updation failed'));
};

const deletePagegroup = (siteId, params) => (dispatch, getState) =>
	axiosInstance
		.post('/channel/deleteChannel', { siteId, channelId: params.channelId })
		.then(response => {
			const {
				global: { sites }
			} = getState();
			const { data } = response.data;
			const { channels, cmsInfo } = data;
			const site = sites.data[siteId];
			const { cmsInfo: siteCMSInfo } = site;
			const { channelsInfo } = siteCMSInfo;

			delete channelsInfo[params.channelKey];
			cmsInfo.channelsInfo = channelsInfo;

			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: {
					siteId,
					key: 'cmsInfo',
					value: cmsInfo
				}
			});
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_ARRAY,
				data: {
					siteId,
					key: 'channels',
					value: channels
				}
			});
			dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: `Pagegroup -- ${params.channelKey} Deleted`
			});
		})
		.catch(err => errorHandler(err, 'Pagegroup deletion failed'));

const updateChannelAutoOptimise = (siteId, params) => (dispatch, getState) => {
	const {
		global: { sites }
	} = getState();
	const site = sites.data[siteId];
	const { cmsInfo } = site;
	const { channelsInfo } = cmsInfo;

	channelsInfo[params.channelKey] = {
		...channelsInfo[params.channelKey],
		autoOptimise: params.autoOptimise
	};

	return axiosInstance
		.post('/channel/updateChannel', {
			siteId,
			platform: params.platform,
			pageGroup: params.pageGroup,
			key: 'autoOptimise',
			value: params.autoOptimise
		})
		.then(() => {
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA_KEY_OBJ,
				data: {
					siteId,
					key: 'cmsInfo',
					value: {
						...cmsInfo,
						channelsInfo
					}
				}
			});
			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: `Auto Optimise updated for ${params.channelKey}`
			});
		})
		.catch(err => errorHandler(err, 'Pagegroup pattern updation failed'));
};

export {
	createChannels,
	fetchChannelsInfo,
	updatePagegroupPattern,
	deletePagegroup,
	updateChannelAutoOptimise
};
