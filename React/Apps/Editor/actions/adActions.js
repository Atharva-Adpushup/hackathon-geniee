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
	updateCustomCss = (adId, customCSS) => ({ type: adActions.UPDATE_CUSTOM_CSS, adId, customCSS }),
	updateNetwork = (adId, params) => ({
		type: adActions.UPDATE_NETWORK,
		adId,
		...params
	}),
	updateAd = (adId, params) => ({
		type: adActions.UPDATE_AD,
		adId,
		params
	}),
	updateAdCode = (adId, adCode, network) => ({ type: adActions.UPDATE_ADCODE, adId, adCode, network }),
	updateLogWritten = (adId, isLogWritten) => ({ type: adActions.UPDATE_LOG_WRITTEN, adId, isLogWritten });

export { createAd, deleteAd, updateCss, updateCustomCss, updateAdCode, updateNetwork, updateAd, updateLogWritten };
