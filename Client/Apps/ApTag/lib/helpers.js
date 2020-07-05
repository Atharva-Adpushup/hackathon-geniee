/* eslint-disable no-alert */
import clipboard from 'clipboard-polyfill';
import { DEFAULT_ADS_RESPONSE, DEFAULT_GLOBAL_RESPONSE } from '../configs/commonConsts';

function makeFirstLetterCapitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1).replace(/([A-Z])/g, ' $1');
}

function copyToClipBoard(content) {
	clipboard.writeText(content);
	window.alert('Successfully Copied');
}

function getAdsAndGlobal(state, props) {
	const { apTag } = state.apps;
	const {
		global: { user }
	} = state;

	const {
		data: { adServerSettings = {} }
	} = user;
	const { dfp = {} } = adServerSettings;

	const {
		match: { params }
	} = props;

	const { siteId } = params;
	const ads = apTag.ads[siteId] || DEFAULT_ADS_RESPONSE;
	const global = apTag.global[siteId] || DEFAULT_GLOBAL_RESPONSE;
	const networkCode = dfp.activeDFPNetwork;

	return {
		siteId,
		ads,
		global,
		networkCode
	};
}

export { makeFirstLetterCapitalize, copyToClipBoard, getAdsAndGlobal };
