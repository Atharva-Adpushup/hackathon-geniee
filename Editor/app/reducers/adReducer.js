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
					adCode: payload.adCode,
					css: payload.css,
					height: payload.height,
					width: payload.width,
					network: payload.network
				},
				// Network data object is only added when custom zone id value is added
				// through Visual Editor
				isNetworkData = !!(payload.networkData && Object.keys(payload.networkData).length),
				isZoneId = !!(isNetworkData && payload.networkData.zoneId);

			if (isZoneId) {
				createAdObject.networkData = { zoneId: payload.networkData.zoneId };
			}

			return { ...state,
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
					adCode: payload.adCode ? payload.adCode : undefined,
					network: payload.network,
					secondaryCss: payload.secondaryCss
				},
				// Network data object is only added when custom zone id value is added
				// through Visual Editor
				isInContentAdNetworkData = !!(payload.networkData && Object.keys(payload.networkData).length),
				isInContentAdZoneId = !!(isInContentAdNetworkData && payload.networkData.zoneId);

			if (isInContentAdZoneId) {
				createInContentAdObject.networkData = { zoneId: payload.networkData.zoneId };
			}

			return { ...state,
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
			return { ...state, [action.adId]: { ...state[action.adId], adCode: action.adCode } };

		case adActions.UPDATE_CSS:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.css } };

		case sectionActions.UPDATE_INCONTENT_FLOAT:
			return { ...state, [action.adId]: { ...state[action.adId], css: action.floatCss } };

		case variationActions.COPY_VARIATION:
			const ads = {};
			_.each(action.ads, (section) => (ads[section.id] = section));
			return { ...state, ...ads };

		default:
			return state;
	}
};

export default adsByIds;
