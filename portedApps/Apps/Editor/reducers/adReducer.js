import { sectionActions, adActions, variationActions } from 'consts/commonConsts';
import { immutableObjectDelete } from 'libs/immutableHelpers';
import _ from 'lodash';

const adsByIds = (state = {}, action) => {
	let payload;
	switch (action.type) {
		case sectionActions.CREATE_SECTION:
		case adActions.CREATE_AD:
			payload = action.adPayload ? action.adPayload : action.payload;
			// TODO: Make this reducer pure by moving out all below conditional logic in action thunk
			const createAdObject = {
					id: payload.id,
					// adCode: payload.adCode,
					css: payload.css,
					height: payload.height,
					width: payload.width,
					network: payload.network,
					fluid: payload.fluid
				},
				// Network data object is only added when custom zone id value is added
				// through Visual Editor
				isNetworkData = !!(payload.networkData && Object.keys(payload.networkData).length),
				isZoneId = !!(isNetworkData && payload.networkData.zoneId);

			if (isZoneId) {
				createAdObject.networkData = { zoneId: payload.networkData.zoneId };
			}
			if (isNetworkData) {
				createAdObject.networkData = Object.assign(
					{},
					createAdObject.networkData,
					payload.networkData
				);
			}

			return {
				...state,
				[payload.id]: createAdObject
			};

		case sectionActions.CREATE_INCONTENT_SECTION:
			payload = action.adPayload;

			// TODO: Make this reducer pure by moving out all below conditional logic in action thunk
			const createInContentAdObject = {
					id: payload.id,
					width: payload.width,
					height: payload.height,
					css: payload.css,
					customCSS: payload.customCSS,
					// adCode: payload.adCode ? payload.adCode : undefined,
					network: payload.network,
					secondaryCss: payload.secondaryCss
				},
				// Network data object is only added when custom zone id value is added
				// through Visual Editor
				isInContentAdNetworkData = !!(
					payload.networkData && Object.keys(payload.networkData).length
				),
				isInContentAdZoneId = !!(isInContentAdNetworkData && payload.networkData.zoneId),
				isInContentMultipleAdSizes = !!(payload.multipleAdSizes && payload.multipleAdSizes.length);

			if (isInContentAdZoneId) {
				createInContentAdObject.networkData = { zoneId: payload.networkData.zoneId };
			}

			if (isInContentAdZoneId) {
				createInContentAdObject.networkData = { zoneId: payload.networkData.zoneId };
			}
			if (isInContentAdNetworkData) {
				let networkData = createInContentAdObject.networkData || {};
				createInContentAdObject.networkData = Object.assign({}, networkData, payload.networkData);
			}
			if (isInContentMultipleAdSizes) {
				createInContentAdObject.multipleAdSizes = payload.multipleAdSizes.concat([]);
			}

			return {
				...state,
				[payload.id]: createInContentAdObject
			};

		case adActions.DELETE_AD:
			return immutableObjectDelete(state, 'id', action.adId);

		case sectionActions.UPDATE_PARTNER_DATA:
			// TODO: Make this reducer pure by moving out all below conditional logic in action thunk
			const isCustomZoneId = !!(action.partnerData && action.partnerData.customZoneId),
				updateAdObject = _.extend({}, state[action.adId]);

			if (isCustomZoneId) {
				updateAdObject.networkData = { zoneId: action.partnerData.customZoneId };
			} else if (updateAdObject.networkData) {
				delete updateAdObject.networkData;
			}

			return { ...state, [action.adId]: updateAdObject };

		case adActions.UPDATE_ADCODE:
			return {
				...state,
				[action.adId]: {
					...state[action.adId],
					adCode: action.adCode,
					network: action.network,
					networkData: { ...state[action.adId].networkData, priceFloor: 0 }
				}
			};

		/**
		 * Set Network
		 *
		 * For ADP TAG
		 * 		Set adCode to ''
		 * 		Set Network Data
		 *			keyValues
		 *				Set key --> priceFloor
		 * 			Set headerBiddingFlag
		 *
		 * For Others
		 * 		Set adCode
		 * 		Set Network Data
		 * 			Set adCode
		 *
		 * 			For Adsense
		 *				Add adUnitId
		 */

		case adActions.UPDATE_NETWORK:
			return {
				...state,
				[action.adId]: {
					...state[action.adId],
					network: action.network,
					fluid: action.networkData.fluid,

					// adCode:
					// 	action.network == 'adpTags'
					// 		? ''
					// 		: action.networkData.adCode ? action.networkData.adCode : state[action.adId].adCode,
					networkData:
						action.network == state[action.adId].network
							? {
									...state[action.adId].networkData,
									...action.networkData
							  }
							: action.networkData
				}
			};

		case adActions.UPDATE_LOG_WRITTEN:
			return {
				...state,
				[action.adId]: {
					...state[action.adId],
					networkData: {
						...state[action.adId].networkData,
						logWritten: action.isLogWritten
					}
				}
			};

		case adActions.UPDATE_CSS:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.css } };

		case adActions.UPDATE_CUSTOM_CSS:
			return { ...state, [action.adId]: { ...state[action.adId], customCSS: action.customCSS } };

		case adActions.UPDATE_AD:
			return { ...state, [action.adId]: { ...state[action.adId], ...action.params } };

		case adActions.UPDATE_MULTIPLE_AD_SIZES:
			return {
				...state,
				[action.adId]: { ...state[action.adId], multipleAdSizes: action.multipleAdSizes }
			};

		case sectionActions.UPDATE_INCONTENT_FLOAT:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.floatCss } };

		case variationActions.COPY_VARIATION:
			const ads = {};
			_.each(action.ads, section => (ads[section.id] = section));
			return { ...state, ...ads };

		default:
			return state;
	}
};

export default adsByIds;
