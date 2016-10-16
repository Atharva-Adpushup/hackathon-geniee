import {variationActions} from 'consts/commonConsts';
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
	copyVariation = (copyFrom) => {
		return {
			type: variationActions.COPY_VARIATION,
			copyFrom
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

export {addVariation, copyVariation, deleteVariation, updateVariation, setActiveVariation};
