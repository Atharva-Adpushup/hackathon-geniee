import {channelActions} from 'consts/commonConsts';
import {addVariation} from 'actions/variationActions';
import Utils from 'libs/custom/utils';

const openChannel = (channelId) => {
		return {
			type: channelActions.OPEN_CHANNEL,
			channelId
		};
	},
	openChannelSuccess = (channelId) => {
		return (dispatch, getState) => {
			dispatch({
				type: channelActions.OPEN_CHANNEL_SUCCESS,
				channelId
			});
			const {channelData} = getState();
			if (!channelData.byIds[channelId].variations.length) {
				dispatch(addVariation({name: 'Variation 1'}, channelId));
			}
		};
	},
	setActiveChannel =  (channelId) => {
		return {
			type: channelActions.SET_ACTIVE_CHANNEL,
			channelId
		};
	},
	createChannel = (payload) => {
		return {
			type: channelActions.CREATE_CHANNEL,
			payload: Object.assign(payload, {id: Utils.getRandomNumber(), createTs: Math.floor(Date.now() / 1000), variations: []})
		};
	},
	editSampleUrl = (channelId, sampleUrl) => {
		return {
			type: channelActions.EDIT_SAMPLE_URL,
			sampleUrl,
			channelId
		};
	},
	changeContentSelector = (channelId, selector) => {
		return {
			type: channelActions.CHANGE_CONTENT_SELECTOR,
			selector,
			channelId
		};
	},
	loadCmsInfo = (cmsInfo) => {
		return {
			type: channelActions.LOAD_CMS_INFO,
			cmsInfo
		};
	},
	saveChannelBeforeAfterJs = (channelId, jsType, code) => {
		return {
			type: channelActions.SAVE_BEFORE_AFTER_JS,
			channelId,
			jsType,
			code
		};
	};

export {openChannel, openChannelSuccess, setActiveChannel, createChannel,
	editSampleUrl, changeContentSelector, loadCmsInfo, saveChannelBeforeAfterJs};
