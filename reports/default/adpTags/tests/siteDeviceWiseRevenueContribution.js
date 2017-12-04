const queryHelper = require('../queries/siteDeviceWiseRevenueContribution'),
	parameterConfig = {
		siteId: 25019,
		fromDate: '2017-11-19',
		toDate: '2017-11-24',
		transform: true
	};

function getData() {
	return queryHelper
		.getData(parameterConfig)
		.then(resultData => {
			console.log(`Successfully got device wise revenue contribution data: ${JSON.stringify(resultData)}`);
		})
		.catch(err => {
			console.error(`Error while fetching device wise revenue contribution data: ${err.message}`);
		});
}

setTimeout(function() {
	getData();
}, 5000);
