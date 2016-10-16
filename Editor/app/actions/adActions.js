import { adActions, defaultSectionCss } from 'consts/commonConsts';
import Utils from 'libs/utils';

const createAd = (payload) => {
		return {
			type: adActions.CREATE_SECTION,
			payload: Object.assign(payload, { id: Utils.getRandomNumber(), css: payload.css ? payload.css : defaultSectionCss })
		};
	},
	deleteAd = (adId, sectionId) => ({ type: adActions.DELETE_AD, adId, sectionId }),
	updateCss = (adId, css) => {
		return {
			type: adActions.UPDATE_CSS,
			adId,
			css
		};
	},
	updateAdCode = (adId, adCode) => {
		return {
			type: adActions.UPDATE_ADCODE,
			adId,
			adCode
		};
	};

export { createAd, deleteAd, updateCss, updateAdCode };
