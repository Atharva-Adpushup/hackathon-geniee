import _ from 'lodash';
import { getActiveChannelActiveVariationId, getVariationSectionsWithAds } from '../selectors/variationSelectors';
import { getActiveChannel } from '../selectors/channelSelectors';
import { messengerCommands } from '../consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';


const getData = (state) => {
		const activeChannel = getActiveChannel(state);
		if (!activeChannel) {
			return false;
		}
		const activeVariation = getActiveChannelActiveVariationId(state),
			sections = activeVariation ? getVariationSectionsWithAds(state, { variationId: activeVariation }) : [];

		return {
			insertMenuVisible: state.ui.insertMenu.isVisible,
			editMenuVisible: state.ui.editMenu.isVisible,
			layout: {
				...sections,
				contentSelector: activeChannel.contentSelector,
				channelId: activeChannel.id
			},
			activeChannelId: activeChannel.id
		};
	},
	postMessageHanlder = store => next => (action) => {
		const prevState = getData(store.getState());

		next(action);

		const nextState = getData(store.getState());

		if (nextState) {
			if (!_.isEqual(prevState.layout, nextState.layout)) {
				sendMessage(nextState.activeChannelId, messengerCommands.UPDATE_LAYOUT, nextState.layout);
			} else if ((prevState.insertMenuVisible && !nextState.insertMenuVisible) || (prevState.editMenuVisible && !nextState.editMenuVisible)) {
				sendMessage(nextState.activeChannelId, messengerCommands.HIDE_ELEMENT_SELECTOR, {});
			}
		}

		return store.getState();
	};

export default postMessageHanlder;
