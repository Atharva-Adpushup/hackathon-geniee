import { channelActions, proxy } from 'consts/commonConsts';
import { addVariation } from 'actions/variationActions';
import { getOpenChannels, getActiveChannelId } from 'selectors/channelSelectors';
import Utils from 'libs/utils';
import _ from 'lodash';

const openChannel = channelId => ({ type: channelActions.OPEN_CHANNEL, channelId }),
	closeChannel = channelId => {
		return (dispatch, getState) => {
			const state = getState(),
				activeChannelId = getActiveChannelId(state);

			chrome.runtime.sendMessage(
				proxy.EXTENSION_ID,
				{ cmd: channelActions.CLOSE_CHANNEL, data: { channelId: activeChannelId } },
				response => {}
			);
			dispatch({ type: channelActions.CLOSE_CHANNEL, channelId, activeChannelId });
		};
	},
	openChannelSuccess = channelId => {
		return (dispatch, getState) => {
			dispatch({
				type: channelActions.OPEN_CHANNEL_SUCCESS,
				channelId
			});
			const { channelData } = getState();
			if (!channelData.byIds[channelId].variations.length) {
				dispatch(addVariation(channelId));
			}
		};
	},
	setActiveChannel = channelId => {
		return {
			type: channelActions.SET_ACTIVE_CHANNEL,
			channelId
		};
	},
	createChannel = payload => {
		return {
			type: channelActions.CREATE_CHANNEL,
			payload: Object.assign(payload, {
				id: Utils.getRandomNumber(),
				createTs: Math.floor(Date.now() / 1000),
				variations: []
			})
		};
	},
	saveSampleUrl = (channelId, sampleUrl) => {
		return {
			type: channelActions.SAVE_SAMPLE_URL,
			channelId,
			sampleUrl
		};
	},
	updateAutoptimize = (channelId, value) => {
		return {
			type: channelActions.UPDATE_AUTOPTIMIZE,
			channelId,
			value
		};
	},
	changeContentSelector = (channelId, selector) => {
		return {
			type: channelActions.CHANGE_CONTENT_SELECTOR,
			selector,
			channelId
		};
	},
	loadCmsInfo = cmsInfo => {
		return {
			type: channelActions.LOAD_CMS_INFO,
			cmsInfo
		};
	},
	contentSelectorMissing = channelId => ({ type: channelActions.CONTENT_SELECTOR_MISSING, channelId }),
	contentSelectorWorked = channelId => ({ type: channelActions.CONTENT_SELECTOR_WORKED, channelId }),
	saveChannelBeforeAfterJs = (channelId, jsType, code) => {
		return {
			type: channelActions.SAVE_BEFORE_AFTER_JS,
			channelId,
			jsType,
			code
		};
	};

export {
	openChannel,
	openChannelSuccess,
	setActiveChannel,
	createChannel,
	saveSampleUrl,
	changeContentSelector,
	loadCmsInfo,
	saveChannelBeforeAfterJs,
	contentSelectorWorked,
	contentSelectorMissing,
	closeChannel,
	updateAutoptimize
};
