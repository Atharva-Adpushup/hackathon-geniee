import _ from 'lodash';
import { getActiveChannelActiveVariationId, getVariationSectionsWithAds } from '../selectors/variationSelectors';
import { getActiveChannelId, getActiveChannel } from '../selectors/channelSelectors';
import { messengerCommands } from '../consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';


const getData = (state) => {
		const activeVariation = getActiveChannelActiveVariationId(state),
			sections = activeVariation ? getVariationSectionsWithAds(state, { variationId: activeVariation }) : null;
		return {
			insertMenuVisible: state.ui.insertMenu.isVisible,
			editMenuVisible: state.ui.editMenu.isVisible,
			layout: {
				...sections,
				contentSelector: getActiveChannel(state).contentSelector,
				channelId: getActiveChannelId(state)
			},
			activeChannelId: getActiveChannelId(state)
		};
	},
	postMessageHanlder = store => next => (action) => {
		const prevState = getData(store.getState());

		next(action);

		const nextState = getData(store.getState());

		if (!_.isEqual(prevState.layout, nextState.layout)) {
			sendMessage(nextState.activeChannelId, messengerCommands.UPDATE_LAYOUT, nextState.layout);
		} else if ((prevState.insertMenuVisible && !nextState.insertMenuVisible) || (prevState.editMenuVisible && !nextState.editMenuVisible)) {
			sendMessage(nextState.activeChannelId, messengerCommands.HIDE_ELEMENT_SELECTOR, {});
		}

		return store.getState();
	};

export default postMessageHanlder;
