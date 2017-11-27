const { getSiteAdNetworkWiseDataContributionReport } = require('../commonFunctions'),
	parameterConfig = {
		siteId: 31000,
		fromDate: '2017-11-01',
		toDate: '2017-11-20',
		transform: true
	};

function getData() {
	return getSiteAdNetworkWiseDataContributionReport(parameterConfig)
		.then(resultData => {
			console.log(`Successfully got AdNetwork Wise Data Contribution: ${JSON.stringify(resultData)}`);
		})
		.catch(err => {
			console.error(`Error while fetching AdNetwork Wise Data Contribution: ${err.message}`);
		});
}

setTimeout(function() {
	getData();
}, 5000);
