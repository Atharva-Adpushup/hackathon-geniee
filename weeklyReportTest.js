const { getWeeklyComparisionReport } = require('./helpers/commonFunctions'),
	Promise = require('bluebird'),
	parameterConfig = {
		siteId: 29752
	};

function getData() {
	return getWeeklyComparisionReport(parameterConfig.siteId)
		.then(weeklyEmailReport => {
			console.log(`Successfully got Weekly Email Report data: ${JSON.stringify(weeklyEmailReport)}`);
		})
		.catch(err => {
			console.log(`Error while fetching API data: ${err}`);
		});
}

setTimeout(() => {
	getData();
}, 3000);
