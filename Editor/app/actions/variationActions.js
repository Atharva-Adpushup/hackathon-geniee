import { variationActions } from 'consts/commonConsts';
import _ from 'lodash';
import Utils from 'libs/utils';
import { getChannelVariations, getChannelVariationsWithAds, getVariationSectionsWithAds } from 'selectors/variationSelectors';

const getLastVariationNumber = function (variations) {
		const names = variations.map(({ name }) => {
			return name.indexOf('Variation') === -1 ? 0 : parseInt(Utils.stringReverse(name), 10);
		});
		return names.length ? names.sort().reverse()[0] : 0;
	},
	addVariation = (channelId) => (dispatch, getState) => {
		const variationId = Utils.getRandomNumber(),
			state = getState();
		dispatch({
			type: variationActions.ADD_VARIATION,
			channelId,
			variationId,
			payload: {
				name: `Variation ${getLastVariationNumber(getChannelVariationsWithAds(state, { channelId })) + 1}`,
				trafficDistribution: 0,
				id: variationId,
				createTs: Math.floor(Date.now() / 1000),
				sections: [],
				customJs: {
					beforeAp: null,
					afterAp: null
				}
			}
		});
	},
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
			sections: _.map(copyFromVariation.sections, (section) => {
				const sectionId = Utils.getRandomNumber();
				sectionIds.push(sectionId);
				return {
					...section,
					id: sectionId,
					name: `Section-${sectionId}`,
					ads: _.map(section.ads, (ad) => {
						const adId = Utils.getRandomNumber();
						ads.push({ ...ad, id: adId });
						return adId;
					})
				};
			}),
			ads,
			variation: {
				...copyFromVariation,
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
			if(confirm('Are you sure you want to delete this variation ?')) {
				dispatch({ type: variationActions.DELETE_VARIATION, variationId, channelId });
			}
		} else {
			alert('You need at least one variation!');
		}
	},
	setActiveVariation = (variationId) => ({ type: variationActions.SET_ACTIVE_VARIATION, variationId }),
	updateVariation = (variationId, payload) => ({ type: variationActions.UPDATE_VARIATION, variationId, payload }),
	editVariationName = (variationId, channelId, name) => (dispatch, getState) => {
		const variations = getChannelVariations(getState(), { channelId }),
			arr = _.map(variations, (data) => { return data; });
		if (_.find(arr, { name: name })) {
			alert('Cannot create variation with same name!');
			return;
		}
		dispatch({ type: variationActions.EDIT_VARIATION_NAME, variationId, name });
	},
	editTrafficDistribution = (variationId, trafficDistribution) => ({ type: variationActions.EDIT_TRAFFIC_DISTRIBUTION, variationId, trafficDistribution });
export { addVariation, copyVariation, deleteVariation, updateVariation, setActiveVariation, editVariationName, editTrafficDistribution };
