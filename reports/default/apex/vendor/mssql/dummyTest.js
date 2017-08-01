const sqlQueryModule = require('./report'),
	Promise = require('bluebird'),
	paramConfig = {
		'siteId': '',
		'startDate': '2017-07-26',
		'endDate': '2017-07-29',
		//'variationKey': '14654f18-55ba-4f64-91d5-e6446faea544',
		//'platform': 'DESKTOP',
		//'pageGroup': 'HOME',
		//'reportType': 'apex',
		//'step': '1d',
		//'getOnlyPageViews': true,
		'mode': 1
	},
	siteIdsArray = ['25023', '25033', '25098', '25003', '25091', '25094', '25116', '25123', '27098', '25005', '25013', '25062', '25104', '25115', '25118', '25106', '25119', '25120', '25128', '25095', '27325', '25127', '25122', '25063', '28783', '28384'];

function syncArrayPromise(array, fn) {
	let index = 0;
	const resultArr = [];

	return new Promise(function (resolve, reject) {
		function next(result) {
			if (result) { resultArr.push(result); }

			if (index < array.length) {
				fn(array[index++]).then(next, reject);
			} else {
				resolve(resultArr);
			}
		}
		next();
	});
}

function performQueries() {
	return Promise.resolve(siteIdsArray.map(siteId => {
		const parameterConfig = Object.assign({}, paramConfig, {siteId});

		return parameterConfig;
	}))
		.then(configArray => syncArrayPromise(configArray, sqlQueryModule.getMetricsData))
		.then(result => {
			console.log(`Result is: ${JSON.stringify(result)}`);
        })
        .then(process.exit)
		.catch((err) => {
			console.log(`Index.js Module: Error occurred ${err.toString()}`);
		});
}

setTimeout(performQueries, 3000);
