var Promise = require('bluebird'),
	AdPushupError = require('../../../helpers/AdPushupError'),
	mediaModule = require('./modules/media/index'),
	pageGroupModule = require('./modules/pageGroup/index'),
	variationModule = require('./modules/variation/index'),
	sqlQueryModule = require('../../default/apex/vendor/mssql/queryHelpers/fullSiteData'),
	{ getSqlValidParameterDates } = require('../../default/apex/vendor/mssql/utils/utils'),
	siteModel = require('../../../models/siteModel');
const { defaultLanguageCode } = require('../../../i18n/language-mapping');

module.exports = (function(mediaModule, pageGroupModule, variationModule) {
	function getReportData(params) {
		//NOTE: This is done to ensure that sql aggregation report data move
		//from 'test' to 'production' database succesfully.
		//Please remove below dummy string and throw once report data is stable in production
		return Promise.resolve().then(() => {
			const dummyErrorString = 'Geniee Report Service is down. Data will be up by next week';
			throw new Error(dummyErrorString);
		});

		var dateParams = { dateFrom: params.dateFrom, dateTo: params.dateTo };

		params.dateFrom = getSqlValidParameterDates(dateParams).dateFrom;
		params.dateTo = getSqlValidParameterDates(dateParams).dateTo;
		console.log(`Sql report supported dates: ${JSON.stringify(params)}`);

		var localeCode = params.localeCode ? params.localeCode : defaultLanguageCode,
			sqlQueryParameters = {
				siteId: params.siteId,
				startDate: params.dateFrom,
				endDate: params.dateTo,
				mode: 1
			};
		var getSqlReportData = sqlQueryModule.getMetricsData(sqlQueryParameters),
			getSiteModel = siteModel.getSiteById(sqlQueryParameters.siteId),
			getAllChannels = getSiteModel.then(site => site.getAllChannels()),
			getTransformedChannelData = getAllChannels.then(pageGroupModule.transformAllPageGroupsData),
			getSiteMetrics = mediaModule.getMediaMetrics;

		return Promise.join(getSqlReportData, getSiteMetrics, getTransformedChannelData, function(
			sqlReportData,
			siteMetrics,
			allChannelsData
		) {
			const isInValidSqlReportData = !!(!sqlReportData || !Object.keys(sqlReportData).length);

			if (isInValidSqlReportData) {
				throw new AdPushupError('Report data should not be empty');
			}

			return pageGroupModule
				.updatePageGroupData(sqlQueryParameters.siteId, sqlReportData, allChannelsData)
				.then(variationModule.setVariationsTabularData.bind(null, localeCode))
				.then(variationModule.setVariationsHighChartsData)
				.then(function(updatedPageGroupsAndVariationsData) {
					var computedData = { media: siteMetrics, pageGroups: updatedPageGroupsAndVariationsData };

					return pageGroupModule
						.updateMetrics(computedData)
						.then(mediaModule.updateMetrics)
						.then(pageGroupModule.setPageGroupsTabularData.bind(null, localeCode))
						.then(pageGroupModule.setPageGroupsHighChartsData)
						.then(function(finalComputedData) {
							return Promise.resolve(finalComputedData);
						});
				});
		});
	}

	return {
		getReport: getReportData
	};
})(mediaModule, pageGroupModule, variationModule);
