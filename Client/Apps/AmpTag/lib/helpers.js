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
	const { amp } = state.apps;
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
	const ads = amp.ads[siteId] || DEFAULT_ADS_RESPONSE;
	const global = amp.global[siteId] || DEFAULT_GLOBAL_RESPONSE;
	const currentAdDoc = ads.content[0];
	const networkCode = dfp.activeDFPNetwork;

	return {
		siteId,
		ads,
		currentAdDoc,
		global,
		networkCode
	};
}
function computeDownWardCompatibleSizes(sizes, selectedSize) {
	const sizesArray = selectedSize.split('x');
	const width = sizesArray[0];
	const height = sizesArray[1];
	let downwardSizes = '';
	sizes.forEach(val => {
		const arr = val.split('x');
		const computedWidth = arr[0];
		const computedHeight = arr[1];
		if (
			parseInt(computedWidth) <= parseInt(width) &&
			parseInt(computedHeight) <= parseInt(height)
		) {
			downwardSizes = downwardSizes.concat(`${val},`);
		}
	});
	return downwardSizes.replace(/,\s*$/, '');
}

export {
	makeFirstLetterCapitalize,
	copyToClipBoard,
	getAdsAndGlobal,
	computeDownWardCompatibleSizes
};
