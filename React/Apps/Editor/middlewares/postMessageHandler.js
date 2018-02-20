import _ from 'lodash';
import Utils from '../libs/utils';
import {
	getActiveChannelActiveVariationId,
	getVariationStructuredSectionsWithAds,
	getActiveChannelActiveVariation
} from '../selectors/variationSelectors';
import { getActiveChannel } from '../selectors/channelSelectors';
import { messengerCommands, channelActions, sectionActions, variationActions, uiActions } from '../consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';

const getData = state => {
		const activeChannel = getActiveChannel(state);
		if (!activeChannel) {
			return false;
		}
		const activeVariationId = getActiveChannelActiveVariationId(state),
			activeVariation = getActiveChannelActiveVariation(state),
			isActiveVariation = !!activeVariation,
			isContentSelector = !!(isActiveVariation && activeVariation.contentSelector),
			contentSelector = isContentSelector ? activeVariation.contentSelector : '',
			sections = activeVariationId
				? getVariationStructuredSectionsWithAds(state, { variationId: activeVariationId })
				: [];

		return {
			insertMenuVisible: state.ui.insertMenu.isVisible,
			editMenuVisible: state.ui.editMenu.isVisible,
			layout: {
				...sections,
				contentSelector: contentSelector,
				channelId: activeChannel.id
			},
			activeChannelId: activeChannel.id
		};
	},
	postMessageHanlder = store => next => action => {
		const prevState = getData(store.getState());

		next(action);

		const nextState = getData(store.getState());
		const isActionUpdateContentSelector = !!(action.type === variationActions.UPDATE_CONTENT_SELECTOR),
			isValidActionData = !!(action.hasOwnProperty('contentSelector') && action.channelId && action.variationId),
			isValidActionUpdateContentSelector = !!(isActionUpdateContentSelector && isValidActionData),
			difference = Utils.deepDiffMapper.test(nextState.layout, prevState.layout),
			isChanged = difference.isChanged,
			changes = isChanged ? _.map(difference.changes.ADDED, 'info.key') : [],
			isTypedChanged = changes.length && changes.indexOf('type') != -1 ? true : false;

		if (nextState) {
			if (
				action.type !== sectionActions.UPDATE_PARTNER_DATA &&
				(action.type === channelActions.OPEN_CHANNEL_SUCCESS || !_.isEqual(prevState.layout, nextState.layout))
				// action.type === channelActions.OPEN_CHANNEL_SUCCESS &&
				// 	(!_.isEqual(prevState.layout, nextState.layout) && !isTypedChanged)) &&
				// !isTypedChanged
			) {
				sendMessage(nextState.activeChannelId, messengerCommands.UPDATE_LAYOUT, nextState.layout);
			} else if (isValidActionUpdateContentSelector) {
				nextState.layout.contentSelector = action.contentSelector;
				sendMessage(nextState.activeChannelId, messengerCommands.UPDATE_LAYOUT, nextState.layout);
			} else if (
				(prevState.insertMenuVisible && !nextState.insertMenuVisible) ||
				(prevState.editMenuVisible && !nextState.editMenuVisible)
			) {
				sendMessage(nextState.activeChannelId, messengerCommands.HIDE_ELEMENT_SELECTOR, {});
			} else if (action.type === sectionActions.GET_ALL_XPATHS) {
				sendMessage(nextState.activeChannelId, messengerCommands.GET_RELEVANT_XPATHS, {
					xpath: action.xpath,
					sectionId: action.sectionId
				});
			} else if (action.type === sectionActions.VALIDATE_XPATH) {
				sendMessage(nextState.activeChannelId, messengerCommands.VALIDATE_XPATH, {
					xpath: action.xpath,
					sectionId: action.sectionId
				});
			} else if (action.type === sectionActions.VALIDATE_XPATH_SECTION) {
				sendMessage(nextState.activeChannelId, messengerCommands.VALIDATE_XPATH_SECTION, {
					xpath: action.xpath,
					sectionId: action.sectionId
				});
			} else if (action.type == sectionActions.SCROLL_TO_VIEW) {
				sendMessage(nextState.activeChannelId, messengerCommands.SCROLL_TO_VIEW, { adId: action.adId });
			} else if (action.type == uiActions.SET_MODE) {
				sendMessage(nextState.activeChannelId, messengerCommands.SET_MODE, { mode: action.mode });
			}
		}

		return store.getState();
	};

export default postMessageHanlder;
