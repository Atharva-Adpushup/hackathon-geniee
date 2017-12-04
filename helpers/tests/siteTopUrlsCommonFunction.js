const { getSiteTopUrlsReport } = require('../commonFunctions'),
	parameterConfig = {
		siteId: 25019,
		fromDate: '2017-11-16',
		toDate: '2017-11-23',
		count: 5,
		transform: true
	};

function getData() {
	return getSiteTopUrlsReport(parameterConfig)
		.then(resultData => {
			console.log(`Successfully got top url data: ${JSON.stringify(resultData)}`);
		})
		.catch(err => {
			console.error(`Error while fetching top urls data: ${err.message}`);
		});
}

setTimeout(function() {
	getData();
}, 5000);
