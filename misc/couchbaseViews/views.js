/**
 * NAME:        channelByGenieePageGroupId
 * DESCRIPTION: Couchbase view to fetch channel(pagegroup) by geniee channel id
 * LOCATION:    _design/dev_app/_view/channelByGenieePageGroupId
 */
function channelByGenieePageGroupId(doc, meta) {
	if (meta.id.indexOf('chnl::') == 0 && doc.genieePageGroupId) {
		emit(doc.genieePageGroupId, doc);
	}
}

/**
 * NAME:        channelById
 * DESCRIPTION: Couchbase view to fetch channel(pagegroup) by channel id
 * LOCATION:    _design/dev_app/_view/channelById
 */
function channelById(doc, meta) {
	if (meta.id.substring(0, 4) === 'chnl') {
		emit(doc.id, doc);
	}
}

/**
 * NAME:        sitesByAutoOptimiseParameter
 * DESCRIPTION: View to get sites which have enabled 'auto-optimise' site level option (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/sitesByAutoOptimiseParameter
 */
function sitesByAutoOptimiseParameter(doc, meta) {
	var computedObj,
		isAutoOptimise = !!(doc.apConfigs && doc.apConfigs.autoOptimise),
		isModePublish = !!(doc.apConfigs && doc.apConfigs.mode == 1),
		hasSiteNotUpdated = !!(meta.id.indexOf('site::') === 0 && doc.dateModified && isAutoOptimise && isModePublish);

	if (hasSiteNotUpdated) {
		computedObj = { domain: doc.siteDomain, siteId: doc.siteId, dateModified: doc.dateModified };

		emit(doc.dateModified, computedObj);
	}
}

/**
 * NAME:        liveSitesByNonEmptyChannels
 * DESCRIPTION: View to get all relevant sites (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/liveSitesByNonEmptyChannels
 */
function liveSitesByNonEmptyChannels(doc, meta) {
	var isChannelExists = !!(doc.channels && doc.channels.length),
		isApConfigs = !!doc.apConfigs,
		isMode = !!(isApConfigs && doc.apConfigs.mode),
		isModePublish = !!(isMode && doc.apConfigs.mode === 1),
		isLiveSite = !!(meta.id.indexOf('site::') === 0 && isChannelExists && isModePublish);

	if (isLiveSite) {
		emit(doc.siteId, doc.siteId);
	}
}

/**
 * NAME:        liveSitesByValidThirdPartyDFPAndCurrency
 * DESCRIPTION: View to get all sites (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/sitesByNonEmptyChannels
 */

function sitesByNonEmptyChannels(doc, meta) {
	var isChannelExists = !!(doc.channels && doc.channels.length),
		isApConfigs = !!doc.apConfigs,
		isMode = !!(isApConfigs && doc.apConfigs.mode),
		isValidSite = !!(meta.id.indexOf('site::') === 0 && isChannelExists && isMode),
		computedData;

	if (isValidSite) {
		computedData = {};
		computedData.siteId = doc.siteId;
		computedData.channels = doc.channels;

		emit(doc.siteId, computedData);
	}
}

/**
 * NAME:        liveSitesByValidThirdPartyDFPAndCurrency
 * DESCRIPTION: View to get all valid third party DFP currency live sites (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/liveSitesByValidThirdPartyDFPAndCurrency
 */
function liveSitesByValidThirdPartyDFPAndCurrency(doc, meta) {
	var computedObj,
		apConfig = doc.apConfigs,
		isAutoOptimise = !!(apConfig && apConfig.autoOptimise),
		isModePublish = !!(apConfig && apConfig.mode == 1),
		isActiveDFPNetwork = !!(apConfig && apConfig.activeDFPNetwork && apConfig.activeDFPNetwork.length),
		isActiveDFPCurrencyCode = !!(
			apConfig &&
			apConfig.activeDFPCurrencyCode &&
			apConfig.activeDFPCurrencyCode.length &&
			apConfig.activeDFPCurrencyCode.length === 3
		),
		isPrebidGranularityMultiplier = !!(
			apConfig &&
			apConfig.prebidGranularityMultiplier &&
			Number(apConfig.prebidGranularityMultiplier)
		),
		isValidSite = !!(
			meta.id.indexOf('site::') === 0 &&
			isAutoOptimise &&
			isModePublish &&
			isActiveDFPNetwork &&
			isActiveDFPCurrencyCode &&
			isPrebidGranularityMultiplier
		);

	if (isValidSite) {
		computedObj = { domain: doc.siteDomain, siteId: doc.siteId, currencyCode: apConfig.activeDFPCurrencyCode };

		emit(doc.siteId, computedObj);
	}
}
