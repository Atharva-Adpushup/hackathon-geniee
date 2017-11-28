import { adActions, defaultSectionCss } from 'consts/commonConsts';
import Utils from 'libs/utils';

const createAd = payload => ({
		type: adActions.CREATE_SECTION,
		payload: Object.assign(payload, {
			id: Utils.getRandomNumber(),
			css: payload.css ? payload.css : defaultSectionCss
		})
	}),
	deleteAd = (adId, sectionId) => ({ type: adActions.DELETE_AD, adId, sectionId }),
	updateCss = (adId, css) => ({ type: adActions.UPDATE_CSS, adId, css }),
	updateNetwork = (adId, params) => ({
		type: adActions.UPDATE_NETWORK,
		adId,
		...params
	}),
	updateAdCode = (adId, adCode, network) => ({ type: adActions.UPDATE_ADCODE, adId, adCode, network });

export { createAd, deleteAd, updateCss, updateAdCode, updateNetwork };
