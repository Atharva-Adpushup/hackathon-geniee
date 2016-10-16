import { getActiveChannelActiveVariationId, getVariationSectionsWithAds } from '../selectors/variationSelectors';
import { getActiveChannelId } from '../selectors/channelSelectors';
import { messengerCommands } from '../consts/commonConsts';
import { sendMessage } from '../scripts/messengerHelper';

const postMessageHanlder = store => next => (action) => {
	let state = store.getState();
	const prevActiveVariation = getActiveChannelActiveVariationId(state),
		prevSections = prevActiveVariation ? getVariationSectionsWithAds(state, { variationId: prevActiveVariation }) : null;

	next(action);

	state = store.getState();
	const nextActiveVariation = getActiveChannelActiveVariationId(state),
		nextSections = nextActiveVariation ? getVariationSectionsWithAds(state, { variationId: nextActiveVariation }) : null;

	if (prevSections !== nextSections) {
		sendMessage(getActiveChannelId(state), messengerCommands.UPDATE_LAYOUT, nextSections);
		console.log(nextSections);
	}

	return state;
};

export default postMessageHanlder;
