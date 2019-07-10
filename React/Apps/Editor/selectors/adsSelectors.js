import _ from 'lodash';
import { createSelector } from 'reselect';
import { getActiveChannel } from './channelSelectors';

const getAllAds = state => state.adByIds,
	getEmptyAdCodes = state => {
		return _.filter(state.adByIds, ad => {
			return (
				ad.network != 'geniee' &&
				ad.network != 'adpTags' &&
				(!ad.networkData.adCode || !ad.networkData.adCode.length)
			);
		});
	};

export { getAllAds, getEmptyAdCodes };
