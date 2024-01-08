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
		data: { adServerSettings = {}, sites = {} }
	} = user;
	const { dfp = {} } = adServerSettings;

	const {
		match: { params }
	} = props;

	const { siteId } = params;
	const ads = apTag.ads[siteId] || DEFAULT_ADS_RESPONSE;
	const global = apTag.global[siteId] || DEFAULT_GLOBAL_RESPONSE;
	const networkCode = dfp.activeDFPNetwork;
	const siteDomain = (sites[siteId] && sites[siteId].domain) || '';

	return {
		siteId,
		siteDomain,
		ads,
		global,
		networkCode
	};
}

function getInstreamSectionIds(config) {
	const { ads } = config;
	const sectionIds = ads.map(key => ({ name: key.videoSectionId, value: key.name }));
	return sectionIds;
}
function checkAndGetBvsSectionIds(config) {
	const { ads } = config;
	const bannerSectionId = {};

	ads.forEach(ad => {
		const { featuresData } = ad;
		if (
			featuresData &&
			featuresData.bannerReplacementConfig &&
			featuresData.bannerReplacementConfig.platforms
		) {
			const { platforms } = featuresData.bannerReplacementConfig;
			if (platforms && platforms.DESKTOP && platforms.DESKTOP.apSectionIdDesktop) {
				bannerSectionId.desktop = ad.videoSectionId;
			}

			if (platforms && platforms.MOBILE && platforms.MOBILE.apSectionIdMobile) {
				bannerSectionId.mobile = ad.videoSectionId;
			}
		}
	});
	return bannerSectionId;
}

function checkAndGetCompanionSectionIds(config) {
	const { ads = [] } = config;
	const companionSectionIds = { desktop: [], mobile: [] };
	ads.forEach(ad => {
		const { networkData = {}, videoSectionId } = ad || {};
		const { apCompanionAds } = networkData;

		if (!apCompanionAds && videoSectionId) {
			return;
		}

		if (apCompanionAds.DESKTOP && apCompanionAds.DESKTOP.bannerSectionId) {
			companionSectionIds.desktop.push(videoSectionId);
		} else if (apCompanionAds.MOBILE && apCompanionAds.MOBILE.bannerSectionId) {
			companionSectionIds.mobile.push(videoSectionId);
		}
	});
	return companionSectionIds;
}

export {
	makeFirstLetterCapitalize,
	copyToClipBoard,
	getAdsAndGlobal,
	getInstreamSectionIds,
	checkAndGetBvsSectionIds,
	checkAndGetCompanionSectionIds
};
