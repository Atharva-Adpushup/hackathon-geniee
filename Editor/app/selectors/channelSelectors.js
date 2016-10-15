import { createSelector } from 'reselect';
import _ from 'lodash';


const getAllChannels = (state) => state.channelData.byIds,

	getActiveChannel = (state) => getAllChannels(state)[state.channelData.activeChannel],

	getActiveChannelId = (state) => getActiveChannel(state).id,

	getOpenChannels = createSelector([getAllChannels], (channelByIds) => _.filter(channelByIds, { isOpen: true }));


export { getOpenChannels, getAllChannels, getActiveChannel, getActiveChannelId };
