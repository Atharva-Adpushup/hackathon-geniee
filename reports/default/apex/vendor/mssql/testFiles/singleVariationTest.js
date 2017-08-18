const apexSingleVariationModule = require('../../../modules/mssql/singleVariationData'),
	apexSingleChannelVariationModule = require('../../../modules/mssql/singleChannelVariationData'),
	singleChannelVariationQueryHelper = require('../queryHelpers/singleChannelVariationData'),
	{ sqlReportData, apexSinglePageGroupVariationsData } = require('./dummyData'),
	moment = require('moment'),
	Promise = require('bluebird'),
	paramConfig = {
		'siteId': 25019,
		'siteDomain': 'http://koredakedeok.blog.jp/',
		'reportType': 'geniee',
		'platform': 'DESKTOP',
		'pageGroup': 'HOME',
		'startDate': moment(1501659059660, 'x').format('YYYY-MM-DD'),
		'endDate': moment(1502263859660, 'x').format('YYYY-MM-DD'),
		'step': '1d',
		'_': '1502263858621',
		'variationCount': 3,
		'mode': 1,
		'variationId': '284fa527-6d9b-4276-9f98-efc12aa57965'
	};

function testApexModule() {
	return apexSingleVariationModule.getData(paramConfig)
		.then(result => {
			console.log(`testApexModule is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`testApexModule: Error occurred ${err.toString()}`);
		});
}

function testPageGroupVariationsData() {
	return Promise.resolve(apexSinglePageGroupVariationsData)
		.then(apexSingleVariationModule.validateReportData)
		.then(apexSingleVariationModule.getMetrics.bind(null, 'a514a762-06e0-4cc8-8ecc-bc44b85c512b'))
		.then(result => {
			console.log(`testPageGroupVariationsData: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`testPageGroupVariationsData: Error occurred ${err.toString()}`);
		});
}

function testVariationDataWithDummyReportData() {
	const siteId = paramConfig.siteId,
		channelName = `${paramConfig.pageGroup}_${paramConfig.platform}`;

	return Promise.resolve(sqlReportData)
		.then(singleChannelVariationQueryHelper.getMatchedVariations.bind(null, siteId, channelName))
		.then(apexSingleChannelVariationModule.transformData)
		.then(apexSingleVariationModule.validateReportData)
		.then(apexSingleVariationModule.getMetrics.bind(null, 'a514a762-06e0-4cc8-8ecc-bc44b85c512b'))
		.then(result => {
			console.log(`testVariationDataWithDummyReportData: Result is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`testVariationDataWithDummyReportData: Error occurred ${err.toString()}`);
		});
}


// setTimeout(testApexModule, 3000);
//setTimeout(testPageGroupVariationsData, 3000);
setTimeout(testVariationDataWithDummyReportData, 3000);

