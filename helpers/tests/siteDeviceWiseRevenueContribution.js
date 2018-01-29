const { getSiteDeviceWiseRevenueContributionReport } = require('../commonFunctions'),
	parameterConfig = {
		siteId: 25019,
		fromDate: '2017-11-01',
		toDate: '2017-11-20',
		transform: true
	};

function getData() {
	return getSiteDeviceWiseRevenueContributionReport(parameterConfig)
		.then(resultData => {
			console.log(`Successfully got Device Wise Revenue Contribution data: ${JSON.stringify(resultData)}`);
		})
		.catch(err => {
			console.error(`Error while fetching Device Wise Revenue Contribution data: ${err.message}`);
		});
}

setTimeout(function() {
	getData();
}, 5000);

/*****RESULT DATA*****/
// Query for site device wise revenue contribution: 25019
// Successfully got Device Wise Revenue Contribution data: {"aggregated":{"DESKTOP":13220.85,"MOBILE":25650.48},"dayWise":{"DESKT
// OP":{"2017-11-01":771.62,"2017-11-02":742.06,"2017-11-03":677.95,"2017-11-04":627.11,"2017-11-05":610.45,"2017-11-06":819.53,"
// 2017-11-07":761.63,"2017-11-08":759.67,"2017-11-09":761.9,"2017-11-10":622.09,"2017-11-11":536.22,"2017-11-12":596.01,"2017-11
// -13":672.84,"2017-11-14":682.68,"2017-11-15":644.4,"2017-11-16":619.72,"2017-11-17":574.38,"2017-11-18":559.2,"2017-11-19":524
// .6,"2017-11-20":656.79},"MOBILE":{"2017-11-01":1468.88,"2017-11-02":1354.9,"2017-11-03":1138.5,"2017-11-04":1262.74,"2017-11-0
// 5":1379.1,"2017-11-06":1461.45,"2017-11-07":1523.99,"2017-11-08":1312.51,"2017-11-09":1336.23,"2017-11-10":1187.73,"2017-11-11
// ":1226.48,"2017-11-12":1301.42,"2017-11-13":1154.53,"2017-11-14":1305.56,"2017-11-15":1284.43,"2017-11-16":1216.97,"2017-11-17
// ":1107.29,"2017-11-18":1122.22,"2017-11-19":1243.02,"2017-11-20":1262.53}},"contribution":{"DESKTOP":34.01,"MOBILE":65.99}}
