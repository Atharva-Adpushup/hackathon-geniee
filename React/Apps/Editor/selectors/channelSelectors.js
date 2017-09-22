import { createSelector } from 'reselect';
import _ from 'lodash';

const getAllChannels = state => state.channelData.byIds,
	getActiveChannel = state => getAllChannels(state)[state.channelData.activeChannel],
	getActiveChannelId = state => {
		const activeChannel = getActiveChannel(state);
		return activeChannel ? activeChannel.id : null;
	},
	getChannel = (state, props) => getAllChannels(state)[props.channelId],
	getSampleUrl = createSelector(
		[getAllChannels],
		channelByIds => (_.find(channelByIds, 'sampleUrl') ? _.find(channelByIds, 'sampleUrl').sampleUrl : false)
	),
	getOpenChannels = createSelector([getAllChannels], channelByIds => _.filter(channelByIds, { isOpen: true })),
	getClosedChannels = createSelector([getAllChannels], channelByIds => _.filter(channelByIds, { isOpen: false }));

export {
	getOpenChannels,
	getAllChannels,
	getActiveChannel,
	getActiveChannelId,
	getSampleUrl,
	getChannel,
	getClosedChannels
};
