const fullSiteDataQueryHelper = require('./fullSiteData'),
	AdPushupError = require('../../../../../../helpers/AdPushupError'),
	siteModel = require('../../../../../../models/siteModel'),
	pageGroupModule = require('../../../../../partners/geniee/modules/pageGroup/index'),
	Promise = require('bluebird'),
	extend = require('extend');

function getVariationData(parameterConfig, reportData) {
	const pageGroupObject = extend(true, {}, reportData),
		channelKey = parameterConfig.channelName,
		doesChannelKeyExist = !!(pageGroupObject.hasOwnProperty(channelKey) && pageGroupObject[channelKey]);
	let computedData;

	if (!doesChannelKeyExist) { throw new AdPushupError('getVariationData: Channelkey does not exist in sql report data'); }

	computedData = extend(true, {}, pageGroupObject[channelKey].variations);
	return computedData;
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
			getReportData = fullSiteDataQueryHelper.getMetricsData(parameterConfig),
			getSiteModel = siteModel.getSiteById(parameterConfig.siteId),
			getAllChannels = getSiteModel.then(site => site.getAllChannels()),
			getTransformedChannelData = getAllChannels.then(pageGroupModule.transformAllPageGroupsData);

		return Promise.join(getReportData, getTransformedChannelData, (sqlReportData, allChannelsData) => {
			return pageGroupModule.updatePageGroupData(parameterConfig.siteId, sqlReportData, allChannelsData)
				.then(getVariationData.bind(null, parameterConfig));
		});
	}
};
