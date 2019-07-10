import { createSelector } from 'reselect';
import _ from 'lodash';
import { getAllChannels } from './channelSelectors';
import { getAllVariations } from './variationSelectors';
import { getAllSections } from './sectionSelectors';
import { getAllAds } from './adsSelectors';

const getMode = state => state.siteData.mode,
	getPartner = state => state.siteData.partner,
	getCustomSizes = state => state.siteData.customSizes,
	getFinalJson = createSelector(
		[getAllChannels, getAllVariations, getAllSections, getAllAds, getMode, getCustomSizes],
		(allChannels = {}, allVariations = {}, allSections = {}, allAds = {}, siteMode = 2, customSizes) => ({
			siteMode,
			siteId: window.ADP_SITE_ID,
			customSizes,
			siteDomain: window.ADP_SITE_DOMAIN,
			channels: _.map(allChannels, channel => {
				const channelVariations = {};

				_.forEach(channel.variations, variationId => {
					const sections = {};

					channelVariations[variationId] = allVariations[variationId];

					_.forEach(channelVariations[variationId].sections, sectionId => {
						sections[sectionId] = allSections[sectionId];

						const ads = {};
						_.forEach(sections[sectionId].ads, sectionAdId => {
							ads[sectionAdId] = allAds[sectionAdId];
						});

						sections[sectionId].ads = ads;
					});
					channelVariations[variationId].sections = sections;
				});

				channel.variations = channelVariations;
				return channel;
			})
		})
	);

export { getFinalJson, getMode, getPartner, getCustomSizes };
