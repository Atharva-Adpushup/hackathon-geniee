const extend = require('extend'),
	{ fileLogger } = require('../../../../../../../helpers/logger/file/index');

module.exports = {
	// Get complete data for selected variation
	getData: function(config, sqlReportData, variation, pageGroup) {
		let selectedVariationObj = {};
		const computedData = {
				siteId: config.siteId,
				startDate: (config.dateFrom),
				endDate: (config.dateTo),
				variationKey: variation.id,
				platform: pageGroup.device,
				pageGroup: pageGroup.pageGroup,
				channelName: (`${pageGroup.pageGroup}_${pageGroup.device}`)
			},
			isSqlReportData = !!(sqlReportData && Object.keys(sqlReportData).length),
			isValidSiteId = !!(isSqlReportData && sqlReportData.hasOwnProperty(computedData.siteId) && sqlReportData[computedData.siteId]),
			isValidChannel = !!(isValidSiteId && sqlReportData[computedData.siteId].pageGroups && sqlReportData[computedData.siteId].pageGroups[computedData.channelName]),
			isValidVariationId = !!(isValidChannel && sqlReportData[computedData.siteId].pageGroups[computedData.channelName].variations && sqlReportData[computedData.siteId].pageGroups[computedData.channelName].variations[computedData.variationKey]);

		if (!isSqlReportData || !isValidVariationId) { return selectedVariationObj; }

		selectedVariationObj = extend(true, {}, sqlReportData[computedData.siteId].pageGroups[computedData.channelName].variations[computedData.variationKey]);
		return selectedVariationObj;
	}
};
