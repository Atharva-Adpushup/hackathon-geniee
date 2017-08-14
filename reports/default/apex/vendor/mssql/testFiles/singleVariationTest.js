const singleVariationData = require('../../../modules/mssql/singleVariationData'),
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
		'mode': 1,
		'variationId': '284fa527-6d9b-4276-9f98-efc12aa57965'
	};

function getQueryData() {
	return singleVariationData.getData(paramConfig)
		.then(result => {
			console.log(`Result is: ${JSON.stringify(result)}`);
		})
		.catch((err) => {
			console.log(`SingleChannelVariationData Test Module: Error occurred ${err.toString()}`);
		});
}
setTimeout(getQueryData, 3000);
