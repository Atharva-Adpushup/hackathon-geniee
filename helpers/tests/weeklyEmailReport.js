const { getWeeklyEmailReport } = require('../commonFunctions'),
	Promise = require('bluebird'),
	parameterConfig = {
		siteId: 29752
	};

function getData() {
	return getWeeklyEmailReport(parameterConfig.siteId)
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
