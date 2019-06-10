// import { PAGEGROUP_ACTIONS } from '../../../constants/opsPanel';
import { SITE_ACTIONS, UI_ACTIONS } from '../../../constants/global';
import axiosInstance from '../../../helpers/axiosInstance';
import { errorHandler } from '../../../helpers/commonFunctions';

const createPagegroups = (siteId, channels) => (dispatch, getState) =>
	axiosInstance
		.post('/channel/createChannels', { siteId, channels })
		.then(response => {
			const { data } = response.data;
			const { failed, successful } = data;
			const state = getState();
			const site = state.global.sites.data[siteId];
			const { cmsInfo } = site;

			if (successful && successful.channels.length) {
				const updatedCMSInfo = {
					...cmsInfo,
					pageGroups: [...cmsInfo.pageGroups, ...successful.cmsInfo.pagegroups]
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
					message += `<br />${current.device.toUpperCase()}:${current.pageGroupName} -- ${current
						.additionalData.message || 'No error message found'}`;
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
		.catch(err => errorHandler(err, 'Ad Creation Failed. Please contact AdPushup Operations Team'));

export { createPagegroups };
