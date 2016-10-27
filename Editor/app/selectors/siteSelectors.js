import { createSelector } from 'reselect';
import _ from 'lodash';
import { getAllChannels } from './channelSelectors';
import { getAllVariations } from './variationSelectors';
import { getAllSections } from './sectionSelectors';
import { getAllAds } from './adsSelectors';

const getAfterSaveLoaderState = (state) => state.site.afterSaveLoader.status,

	getFinalJson = createSelector([getAllChannels, getAllVariations, getAllSections, getAllAds], (allChannels = {}, allVariations = {}, allSections = {}, allAds = {}) => (
		_.map(allChannels, (channel) => {
			const channelVariations = {};

			_.forEach(channel.variations, (variationId) => {
				const sections = {},
					ads = {};

				channelVariations[variationId] = allVariations[variationId];

				_.forEach(channelVariations[variationId].sections, (sectionId) => {
					sections[sectionId] = allSections[sectionId];

					_.forEach(sections[sectionId].ads, (sectionAdId) => {
						ads[sectionAdId] = allAds[sectionAdId];
					});

					sections[sectionId].ads = ads;
				});
				channelVariations[variationId].sections = sections;
			});

			channel.variations = channelVariations;
			return channel;
		})
	));

export { getAfterSaveLoaderState, getFinalJson };
