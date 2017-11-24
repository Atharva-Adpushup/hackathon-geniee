const siteTopUrlsQuery = require('../queries/siteTopUrls'),
	parameterConfig = {
		siteId: 28822,
		fromDate: '2017-11-16',
		toDate: '2017-11-22',
		count: 5,
		transform: true
	};

function getData() {
	return siteTopUrlsQuery
		.getData(parameterConfig)
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
