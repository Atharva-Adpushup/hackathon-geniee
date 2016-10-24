import { createSelector } from 'reselect';
import _ from 'lodash';
import { getAllChannels } from './channelSelectors';
import { getAllVariations } from './variationSelectors';
import { getAllSections } from './sectionSelectors';
import { getAllAds } from './adsSelectors';

const getAfterSaveLoaderState = (state) => state.site.afterSaveLoader.status,

	getFinalJson = createSelector([getAllChannels, getAllVariations, getAllSections, getAllAds], (allChannels = {}, allVariations = {}, allSections = {}, allAds = {}) => (
		_.map(allChannels, (channel) => {
			const channelVariations = _.map(channel.variations, (variationId) => allVariations[variationId]);
			return {
				...channel,
				variations: _.map(channelVariations, (variation) => {
					const sections = _.map(variation.sections, (sectionId) => allSections[sectionId]);
					return { ...variation, sections: _.map(sections, (section) => ({ ...section, ads: _.map(section.ads, (sectionAdId) => allAds[sectionAdId]) })) };
				}) };
		})
	));

export { getAfterSaveLoaderState, getFinalJson };
