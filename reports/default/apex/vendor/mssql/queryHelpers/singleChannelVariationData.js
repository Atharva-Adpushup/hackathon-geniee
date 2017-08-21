const fullSiteDataQueryHelper = require('./fullSiteData'),
	AdPushupError = require('../../../../../../helpers/AdPushupError'),
	siteModel = require('../../../../../../models/siteModel'),
	pageGroupModule = require('../../../../../partners/geniee/modules/pageGroup/index'),
	Promise = require('bluebird'),
	extend = require('extend');

function getVariationsData(channelName, reportData) {
	const pageGroupObject = extend(true, {}, reportData),
		channelKey = channelName,
		doesChannelKeyExist = !!(pageGroupObject.hasOwnProperty(channelKey) && pageGroupObject[channelKey]);
	let computedData;

	if (!doesChannelKeyExist) { throw new AdPushupError('getVariationsData: Channelkey does not exist in sql report data'); }

	computedData = extend(true, {}, pageGroupObject[channelKey].variations);
	return computedData;
}

function getMatchedVariationsData(siteId, channelKey, sqlReportData) {
	const getSiteModel = siteModel.getSiteById(siteId),
		getAllChannels = getSiteModel.then(site => site.getAllChannels()),
		getTransformedChannelData = getAllChannels.then(pageGroupModule.transformAllPageGroupsData);

	return Promise.join(getTransformedChannelData, (allChannelsData) => {
		return pageGroupModule.updatePageGroupData(siteId, sqlReportData, allChannelsData)
			.then(getVariationsData.bind(null, channelKey));
	});
}

module.exports = {
	getData: (inputParamConfig) => {
		const parameterConfig = {
				mode: inputParamConfig.mode ? inputParamConfig.mode : 1,
				startDate: inputParamConfig.startDate,
				endDate: inputParamConfig.endDate,
				siteId: inputParamConfig.siteId,
				channelName: `${inputParamConfig.pageGroup}_${inputParamConfig.platform}`
			},
			siteId = parameterConfig.siteId,
			channelName = parameterConfig.channelName;

		return fullSiteDataQueryHelper.getMetricsData(parameterConfig)
			.then(getMatchedVariationsData.bind(null, siteId, channelName));
	},
	getMatchedVariations: getMatchedVariationsData
};