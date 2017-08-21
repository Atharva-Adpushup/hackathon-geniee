const fullSiteDataQueryHelper = require('./fullSiteData'),
	AdPushupError = require('../../../../../../helpers/AdPushupError'),
	siteModel = require('../../../../../../models/siteModel'),
	Promise = require('bluebird'),
	extend = require('extend'),
	_ = require('lodash');

function transformAllPageGroupsData(inputChannelData) {
	const emptyChannelDataStr = 'Channel data should not be empty';
	if (!inputChannelData || !inputChannelData.length) { throw new AdPushupError(emptyChannelDataStr); }

	const computedData = inputChannelData.concat([]);

	return computedData.reduce((accumulatorObject, channelObject) => {
		accumulatorObject[channelObject.channelName] = {
			id: channelObject.id,
			sampleUrl: channelObject.sampleUrl,
			pageGroup: channelObject.pageGroup,
			device: channelObject.platform,
			channelName: channelObject.channelName,
			variations: extend(true, {}, channelObject.variations)
		};

		return accumulatorObject;
	}, {});
}

function updatePageGroupData(siteId, sqlReportData, allChannelsData) {
	const allPageGroupData = extend(true, {}, allChannelsData),
		sqlReportPageGroupData = extend(true, {}, sqlReportData[siteId].pageGroups),
		channelKeys = _.keys(allPageGroupData),
		computedData = {};

	_.forEach(channelKeys, (channelKey) => {
		const isChannelKeyInSqlReportData = !!(sqlReportPageGroupData.hasOwnProperty(channelKey) && sqlReportPageGroupData[channelKey]),
			initialMetrics = { dayWisePageViews: {}, days: {}, tracked: { pageViews: 0, click: 0, pageCTR: 0.0, impression: 0 }, click: 0, impression: 0, revenue: 0.0, pageViews: 0, pageRPM: 0.0, pageCTR: 0.0 };
		let channelPageGroupObject = extend(true, {}, allPageGroupData[channelKey]);

		if (isChannelKeyInSqlReportData) {
			const sqlReportPageGroupObject = extend(true, {}, sqlReportPageGroupData[channelKey]),
				sqlReportPageGroupVariationKeys = _.keys(sqlReportPageGroupObject.variations);

			//NOTE: A deep extend will also effect source objects, they also extend each other properties
			// sqlReportPageGroupObject will extend channelPageGroupObject properties and vice versa
			computedData[channelKey] = extend(true, sqlReportPageGroupObject, channelPageGroupObject);

			// Iterate over all page group variations and delete the variation which is
			// non-existent in Sql reports variation data, i.e., Only include the variations which
			// are present in both sql report and database channels data
			_.forOwn(channelPageGroupObject.variations, (variationObject, variationKey) => {
				const doesVariationKeyMatch = _.includes(sqlReportPageGroupVariationKeys, variationKey);

				if (!doesVariationKeyMatch) { delete computedData[channelKey].variations[variationKey]; }
			});
		} else {
			const computedPageGroupObject = extend(true, {}, channelPageGroupObject);

			_.forOwn(computedPageGroupObject.variations, (variationObject) => {
				const variationMetrics = extend(true, {}, initialMetrics);

				extend(true, variationObject, variationMetrics);
			});

			computedData[channelKey] = extend(true, {}, computedPageGroupObject);
		}
	});

	return Promise.resolve(computedData);
}

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
		getTransformedChannelData = getAllChannels.then(transformAllPageGroupsData);

	return Promise.join(getTransformedChannelData, (allChannelsData) => {
		return updatePageGroupData(siteId, sqlReportData, allChannelsData)
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
