import _ from 'lodash';
import { createSelector } from 'reselect';
import { getAllSections } from './sectionSelectors';
import { getActiveChannel, getChannel } from './channelSelectors';
import { getAllAds } from './adsSelectors';

const getAllVariations = state => state.variationByIds,
	getVariation = (state, props) => state.variationByIds[props.variationId],
	getVariationSections = (state, props) => state.variationByIds[props.variationId].sections,
	getActiveChannelActiveVariation = createSelector(
		[getActiveChannel, getAllVariations],
		(activeChanel, allVariations) =>
			activeChanel ? _.find(allVariations, { id: activeChanel.activeVariation }) : null
	),
	getActiveChannelActiveVariationId = createSelector(
		[getActiveChannel],
		activeChanel => (activeChanel ? activeChanel.activeVariation : null)
	),
	getActiveChannelVariations = createSelector(
		[getActiveChannel, getAllVariations],
		(activeChanel = {}, allVariations) => {
			const variations = activeChanel.variations || [];
			return _.filter(allVariations, (variation, variationId) => variations.indexOf(variationId) !== -1);
		}
	),
	getActiveChannelVariationsTrafficDistributions = createSelector([getActiveChannelVariations], allVariations => {
		return allVariations.map(variation => {
			return { name: variation.name, value: variation.trafficDistribution, id: variation.id };
		});
	}),
	getChannelVariations = createSelector([getChannel, getAllVariations], (channel = {}, allVariations) => {
		const variations = channel.variations || [];
		return _.filter(allVariations, (variation, variationId) => variations.indexOf(variationId) !== -1);
	}),
	getVariationSectionsWithAds = createSelector(
		[getVariation, getVariationSections, getAllSections, getAllAds],
		(variation, varitionSections = [], allSections = {}, allAds = {}) => {
			const sections = _.map(varitionSections, sectionId => allSections[sectionId]);
			return {
				...variation,
				sections: _.map(sections, section => ({
					...section,
					ads: _.map(section.ads, sectionAdId => allAds[sectionAdId])
				}))
			};
		}
	),
	getVariationStructuredSectionsWithAds = createSelector(
		[getVariation, getVariationSections, getAllSections, getAllAds],
		(variation, varitionSections = [], allSections = {}, allAds = {}) => {
			let sections = _.map(varitionSections, sectionId => allSections[sectionId]);

			sections = _.filter(sections, section => typeof section.isIncontent === 'undefined');
			return {
				...variation,
				sections: _.map(sections, section => ({
					...section,
					ads: _.map(section.ads, sectionAdId => allAds[sectionAdId])
				}))
			};
		}
	),
	getActiveChannelVariationsWithAds = createSelector(
		[getActiveChannelVariations, getAllSections, getAllAds],
		(activeChannelVariations = [], allSections = {}, allAds = {}) =>
			_.map(activeChannelVariations, variation => {
				const sections = _.map(variation.sections, sectionId => allSections[sectionId]);
				return {
					...variation,
					sections: _.map(sections, section => ({
						...section,
						ads: _.map(section.ads, sectionAdId => allAds[sectionAdId])
					}))
				};
			})
	),
	getChannelVariationsWithAds = createSelector(
		[getChannelVariations, getAllSections, getAllAds],
		(channelVariations = [], allSections = {}, allAds = {}) =>
			_.map(channelVariations, variation => {
				const sections = _.map(variation.sections, sectionId => allSections[sectionId]);
				return {
					...variation,
					sections: _.map(sections, section => ({
						...section,
						ads: _.map(section.ads, sectionAdId => allAds[sectionAdId])
					}))
				};
			})
	),
	getActiveChannelActiveVariationWithAds = createSelector(
		[getActiveChannelVariationsWithAds, getActiveChannelActiveVariationId],
		(activeChannelActiveVariationWithAds = [], activeChannelActiveVariation = '') =>
			_.filter(activeChannelActiveVariationWithAds, { id: activeChannelActiveVariation })[0]
	),
	getCustomAdCodeFromActiveVariation = createSelector(
		[getActiveChannelActiveVariationWithAds],
		(activeVariationWithAds = {}) => {
			let isCustomAdCode = false;
			const isActiveVariation = !!(
				activeVariationWithAds &&
				_.isObject(activeVariationWithAds) &&
				_.keys(activeVariationWithAds).length
			);

			if (isActiveVariation) {
				_.forEach(activeVariationWithAds.sections, sectionObj => {
					_.forEach(sectionObj.ads, adObj => {
						isCustomAdCode = !!(adObj && adObj.adCode);

						if (isCustomAdCode) {
							return false;
						}
					});

					if (isCustomAdCode) {
						return false;
					}
				});
			} else {
				isCustomAdCode = false;
			}

			return isCustomAdCode;
		}
	),
	getZonesDataFromActiveVariation = createSelector(
		[getActiveChannelActiveVariationWithAds],
		(activeVariationWithAds = {}) => {
			const zonesCollection = [],
				isActiveVariation = !!(
					activeVariationWithAds &&
					_.isObject(activeVariationWithAds) &&
					_.keys(activeVariationWithAds).length
				);

			if (isActiveVariation) {
				_.forEach(activeVariationWithAds.sections, sectionObj => {
					_.forEach(sectionObj.ads, adObj => {
						const isGenieeZone = !!(
								adObj &&
								adObj.network === 'geniee' &&
								adObj.networkData &&
								adObj.networkData.zoneId
							),
							zoneObject = {},
							isNetworkData = !!(adObj && adObj.networkData),
							isZoneId = !!(isNetworkData && adObj.networkData.zoneId),
							isDynamicAllocation = !!(isNetworkData && adObj.networkData.dynamicAllocation),
							isDFPAdunitCode = !!(isNetworkData && adObj.networkData.dfpAdunitCode),
							isDFPAdunit = !!(isNetworkData && adObj.networkData.dfpAdunit),
							isMultipleAdSizes = !!(adObj && adObj.multipleAdSizes && adObj.multipleAdSizes.length);

						if (!isGenieeZone) {
							return true;
						}

						isZoneId ? (zoneObject.zoneId = adObj.networkData.zoneId) : null;
						isDynamicAllocation
							? (zoneObject.dynamicAllocation = adObj.networkData.dynamicAllocation)
							: null;
						isDFPAdunitCode ? (zoneObject.dfpAdunitCode = adObj.networkData.dfpAdunitCode) : null;
						isDFPAdunit ? (zoneObject.dfpAdunit = adObj.networkData.dfpAdunit) : null;
						isMultipleAdSizes ? (zoneObject.multipleAdSizes = adObj.multipleAdSizes.concat([])) : null;

						zonesCollection.push(zoneObject);
					});
				});
			}

			return zonesCollection;
		}
	);

export {
	getAllVariations,
	getVariationSectionsWithAds,
	getActiveChannelActiveVariation,
	getActiveChannelVariations,
	getActiveChannelActiveVariationId,
	getActiveChannelVariationsWithAds,
	getChannelVariationsWithAds,
	getActiveChannelVariationsTrafficDistributions,
	getChannelVariations,
	getVariationStructuredSectionsWithAds,
	getActiveChannelActiveVariationWithAds,
	getCustomAdCodeFromActiveVariation,
	getZonesDataFromActiveVariation
};
