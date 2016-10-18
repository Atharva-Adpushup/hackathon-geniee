import { getActiveChannelActiveVariationId, getVariationSectionsWithAds } from '../selectors/variationSelectors';
import { getActiveChannelId } from '../selectors/channelSelectors';
import { messengerCommands } from '../consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';

const postMessageHanlder = store => next => (action) => {
	const prevState = store.getState(),
		prevActiveVariation = getActiveChannelActiveVariationId(prevState),
		prevSections = prevActiveVariation ? getVariationSectionsWithAds(prevState, { variationId: prevActiveVariation }) : null;

	next(action);


	const nextState = store.getState(),
		nextActiveVariation = getActiveChannelActiveVariationId(nextState),
		nextSections = nextActiveVariation ? getVariationSectionsWithAds(nextState, { variationId: nextActiveVariation }) : null;

	if (prevSections !== nextSections) {
		sendMessage(getActiveChannelId(nextState), messengerCommands.UPDATE_LAYOUT, nextSections);
		// console.log(nextSections);
	} else if ((prevState.insertMenu.isVisible && !nextState.insertMenu.isVisible) || (prevState.editMenu.isVisible && !nextState.editMenu.isVisible)) {
		sendMessage(getActiveChannelId(nextState), messengerCommands.HIDE_ELEMENT_SELECTOR, {});
	}

	return nextState;
};

export default postMessageHanlder;
