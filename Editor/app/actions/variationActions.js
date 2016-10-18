import { variationActions } from 'consts/commonConsts';
import _ from 'lodash';
import Utils from 'libs/utils';

const addVariation = (payload, channelId) => {
		const variationId = Utils.getRandomNumber();
		return {
			type: variationActions.ADD_VARIATION,
			channelId,
			variationId,
			payload: Object.assign(payload, {
				id: variationId,
				createTs: Math.floor(Date.now() / 1000),
				sections: [],
				customJs: {
					beforeAp: null,
					afterAp: null
				}
			})
		};
	},
	copyVariation = (copyFromVariation, newName, channelId) => {
		const newVariationId = Utils.getRandomNumber(),
			ads = [],
			sectionIds = [];
		return {
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
		};
	},
	deleteVariation = (variationId) => {
		return {
			type: variationActions.DELETE_VARIATION,
			variationId
		};
	},
	setActiveVariation = (variationId) => {
		return {
			type: variationActions.SET_ACTIVE_VARIATION,
			variationId
		};
	},
	updateVariation = (variationId, payload) => {
		return {
			type: variationActions.UPDATE_VARIATION,
			variationId,
			payload
		};
	};

export { addVariation, copyVariation, deleteVariation, updateVariation, setActiveVariation };
