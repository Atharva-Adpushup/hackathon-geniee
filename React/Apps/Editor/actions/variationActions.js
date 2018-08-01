import { variationActions } from 'consts/commonConsts';
import _ from 'lodash';
import Utils from 'libs/utils';
import { getDefaultNetworkData } from '../scripts/utils';
import {
	getChannelVariations,
	getChannelVariationsWithAds,
	getVariationSectionsWithAds
} from 'selectors/variationSelectors';
import { uiActions } from '../consts/commonConsts';

const getLastVariationNumber = function(variations) {
		const names = variations.map(({ name }) => {
			var reversed = parseInt(name.split(' ')[1], 10),
				vName = isNaN(reversed) ? 0 : reversed;

			return name.indexOf('Variation') === -1 ? 0 : vName;
		});
		return names.length
			? names
					.sort(function(a, b) {
						return a > b;
					})
					.reverse()[0]
			: 0;
	},
	addVariation = channelId => (dispatch, getState) => {
		const variationId = Utils.getRandomNumber(),
			state = getState(),
			variationCount = getLastVariationNumber(getChannelVariationsWithAds(state, { channelId })) + 1,
			variationName = isNaN(variationCount) ? variationId : variationCount;
		dispatch({
			type: variationActions.ADD_VARIATION,
			channelId,
			variationId,
			payload: {
				name: `Variation ${variationName}`,
				trafficDistribution: 0,
				id: variationId,
				createTs: Math.floor(Date.now() / 1000),
				sections: [],
				customJs: {
					beforeAp: null,
					afterAp: null
				},
				disable: false
			}
		});
	},
	updateContentSelector = (variationId, channelId, contentSelector) => ({
		type: variationActions.UPDATE_CONTENT_SELECTOR,
		contentSelector,
		variationId,
		channelId
	}),
	copyVariation = (variationId, channelId) => (dispatch, getState) => {
		const newVariationId = Utils.getRandomNumber(),
			ads = [],
			state = getState(),
			copyFromVariation = getVariationSectionsWithAds(state, { variationId }),
			sectionIds = [],
			newName = `Variation ${getLastVariationNumber(getChannelVariationsWithAds(state, { channelId })) + 1}`;

		dispatch({
			type: variationActions.COPY_VARIATION,
			variationId: newVariationId,
			channelId,
			sections: _.map(copyFromVariation.sections, section => {
				const sectionId = Utils.getRandomNumber();
				sectionIds.push(sectionId);
				return {
					...section,
					id: sectionId,
					name: `Section-${sectionId}`,
					ads: _.map(section.ads, ad => {
						const adId = Utils.getRandomNumber();
						ads.push({ ...ad, adCode: '', networkData: getDefaultNetworkData(ad.network), id: adId });
						return adId;
					})
				};
			}),
			ads,
			variation: {
				...copyFromVariation,
				trafficDistribution: 0,
				id: newVariationId,
				name: newName,
				createTs: Math.floor(Date.now() / 1000),
				sections: sectionIds
			}
		});
	},
	deleteVariation = (variationId, channelId) => (dispatch, getState) => {
		const variations = getChannelVariations(getState(), { channelId });
		if (variations.length > 1) {
			if (confirm('Are you sure you want to delete this variation ?')) {
				dispatch({ type: variationActions.DELETE_VARIATION, variationId, channelId });
			}
		} else {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Operation failed',
				message: 'You need at least one variation!'
			});
		}
	},
	setActiveVariation = variationId => ({ type: variationActions.SET_ACTIVE_VARIATION, variationId }),
	updateVariation = (variationId, payload) => ({ type: variationActions.UPDATE_VARIATION, variationId, payload }),
	disableVariation = (variationId, channelId, payload) => (dispatch, getState) => {
		const allVariations = getChannelVariations(getState(), { channelId }),
			disabledVariations = _.compact(
				_.map(allVariations, variationObj => {
					return !!variationObj.disable;
				})
			),
			hasDisabledVariationsReachedLimit = !!(
				disabledVariations &&
				disabledVariations.length >= 10 &&
				payload &&
				payload.isDisable
			);

		if (hasDisabledVariationsReachedLimit) {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Disabled Variations Limit',
				message: 'Cannot create more than 10 disabled variations!'
			});
			return;
		}

		dispatch({
			type: variationActions.DISABLE_VARIATION,
			variationId,
			payload
		});
	},
	editVariationName = (variationId, channelId, name) => (dispatch, getState) => {
		const variations = getChannelVariations(getState(), { channelId }),
			arr = _.map(variations, data => {
				return data;
			});
		if (_.find(arr, { name: name })) {
			dispatch({
				type: uiActions.SHOW_NOTIFICATION,
				mode: 'error',
				title: 'Operation failed',
				message: 'Cannot create variation with same name!'
			});
			return;
		}
		dispatch({ type: variationActions.EDIT_VARIATION_NAME, variationId, name });
	},
	editTrafficDistribution = (variationId, trafficDistribution) => ({
		type: variationActions.EDIT_TRAFFIC_DISTRIBUTION,
		variationId,
		trafficDistribution
	}),
	saveBeforeJs = (variation, beforeJs) => (dispatch, getState) => {
		dispatch({ type: variationActions.SAVE_BEFORE_JS, variation, beforeJs });
		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successful',
			message: 'Before JS has been saved'
		});
	},
	saveAfterJs = (variation, afterJs) => (dispatch, getState) => {
		dispatch({ type: variationActions.SAVE_AFTER_JS, variation, afterJs });
		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successful',
			message: 'After JS has been saved'
		});
	},
	saveKeyValues = (variation, adpKeyValues) => ({ type: variationActions.SAVE_KEY_VALUES, variation, adpKeyValues }),
	savePersonalizationInfo = (variation, personalization) => (dispatch, getState) => {
		dispatch({ type: variationActions.SAVE_PERSONALIZATION_INFO, variation, personalization });
		dispatch({
			type: uiActions.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Operation Successful',
			message: 'Personalization Info Saved'
		});
	};

export {
	addVariation,
	copyVariation,
	deleteVariation,
	updateVariation,
	disableVariation,
	setActiveVariation,
	editVariationName,
	editTrafficDistribution,
	saveBeforeJs,
	saveAfterJs,
	saveKeyValues,
	updateContentSelector,
	savePersonalizationInfo
};
