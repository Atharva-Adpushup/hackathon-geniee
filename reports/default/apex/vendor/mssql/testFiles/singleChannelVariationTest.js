const apexSingleChannelVariationModule = require('../../../modules/mssql/singleChannelVariationData'),
	singleChannelVariationQueryHelper = require('../queryHelpers/singleChannelVariationData'),
	{ sqlReportData } = require('./dummyData'),
	Promise = require('bluebird'),
	moment = require('moment'),
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
		'mode': 1
	};

function testApexModule() {
	return apexSingleChannelVariationModule.getData(paramConfig)
		.then(result => {
			console.log(`testApexModule: Result is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`testApexModule: Error occurred ${err.toString()}`);
		});
}

function getVariationsDataWithDummyReportData() {
	const siteId = paramConfig.siteId,
		channelName = `${paramConfig.pageGroup}_${paramConfig.platform}`;

	return Promise.resolve(sqlReportData)
		.then(singleChannelVariationQueryHelper.getMatchedVariations.bind(null, siteId, channelName))
		.then(apexSingleChannelVariationModule.transformData)
		.then(result => {
			console.log(`getVariationsDataWithDummyReportData: Result is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`getVariationsDataWithDummyReportData: Error occurred ${err.toString()}`);
		});
}

function queryHelper() {
	return singleChannelVariationQueryHelper.getData(paramConfig)
		.then(result => {
			console.log(`queryHelper: Result is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`queryHelper: Error occurred ${err.toString()}`);
		});
}


// setTimeout(testApexModule, 3000);
// setTimeout(queryHelper, 3000);
setTimeout(getVariationsDataWithDummyReportData, 3000);

