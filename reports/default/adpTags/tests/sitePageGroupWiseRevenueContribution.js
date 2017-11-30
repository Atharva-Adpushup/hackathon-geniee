const queryHelper = require('../queries/sitePageGroupWiseRevenueContribution'),
	parameterConfig = {
		siteId: 29752,
		fromDate: '2017-11-18',
		toDate: '2017-11-25',
		transform: true
	};

function getData() {
	return queryHelper
		.getData(parameterConfig)
		.then(resultData => {
			console.log(`Successfully got PageGroup Wise Revenue Contribution data: ${JSON.stringify(resultData)}`);
		})
		.catch(err => {
			console.error(`Error while fetching PageGroup Wise Revenue Contribution data: ${err.message}`);
		});
}

setTimeout(function() {
	getData();
}, 5000);
