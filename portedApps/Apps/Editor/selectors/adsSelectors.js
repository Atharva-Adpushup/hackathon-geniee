import _ from 'lodash';
import { createSelector } from 'reselect';
import { getActiveChannel } from './channelSelectors';

const getAllAds = state => state.adByIds,
	getEmptyAdCodes = state =>
		_.filter(
			state.adByIds,
			ad =>
				ad.network !== 'geniee' &&
				ad.network !== 'adpTags' &&
				(ad.network === 'adsense' && !ad.networkData.shouldSync) &&
				(!ad.networkData.adCode || !ad.networkData.adCode.length)
		);

export { getAllAds, getEmptyAdCodes };
