import _ from 'lodash';
import { createSelector } from 'reselect';
import { getAllSections } from './sectionSelectors';
import { getActiveChannel } from './channelSelectors';
import { getAllAds } from './adsSelectors';

const getAllVariations = (state) => state.variationByIds,

	getVariation = (state, props) => state.variationByIds[props.variationId],

	getVariationSections = (state, props) => state.variationByIds[props.variationId].sections,

	getActiveChannelActiveVariation = createSelector([getActiveChannel, getAllVariations], (activeChanel, allVariations) => _.find(allVariations, { id: activeChanel.activeVariation })),

	getActiveChannelActiveVariationId = createSelector([getActiveChannel], (activeChanel) => activeChanel.activeVariation),

	getActiveChannelVariations = createSelector([getActiveChannel, getAllVariations], (activeChanel, allVariations) => {
		const variations = activeChanel.variations;
		return _.filter(allVariations, (vraiation, variationId) => variations.indexOf(variationId) !== -1);
	}),


	getVariationSectionsWithAds = createSelector([getVariation, getVariationSections, getAllSections, getAllAds], (variation, varitionSections = [], allSections = {}, allAds = {}) => {
		const sections = _.map(varitionSections, (sectionId) => allSections[sectionId]);
		return { ...variation, sections: _.map(sections, (section) => ({ ...section, ads: _.map(section.ads, (sectionAdId) => allAds[sectionAdId]) })) };
	}),

	getActiveChannelVariationsWithAds = createSelector([getActiveChannelVariations, getAllSections, getAllAds], (activeChannelVariations = [], allSections = {}, allAds = {}) => (
		_.map(activeChannelVariations, (variation) => {
			const sections = _.map(variation.sections, (sectionId) => allSections[sectionId]);
			return { ...variation, sections: _.map(sections, (section) => ({ ...section, ads: _.map(section.ads, (sectionAdId) => allAds[sectionAdId]) })) };
		})
	));

export { getAllVariations, getVariationSectionsWithAds, getActiveChannelActiveVariation, getActiveChannelVariations, getActiveChannelActiveVariationId, getActiveChannelVariationsWithAds };
