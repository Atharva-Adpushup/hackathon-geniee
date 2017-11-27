const {
		getSiteTopUrlsReport,
		getSiteDeviceWiseRevenueContributionReport,
		getSitePageGroupWiseRevenueContributionReport,
		getSiteAdNetworkWiseDataContributionReport
	} = require('../commonFunctions'),
	Promise = require('bluebird'),
	parameterConfig = {
		siteId: 29752,
		fromDate: '2017-11-18',
		toDate: '2017-11-24',
		transform: true,
		count: 5
	};

function getData() {
	const getTopUrls = getSiteTopUrlsReport(parameterConfig),
		getPageGroupWiseRevenue = getSiteDeviceWiseRevenueContributionReport(parameterConfig),
		getDeviceWiseRevenue = getSitePageGroupWiseRevenueContributionReport(parameterConfig),
		getAdNetworkWiseData = getSiteAdNetworkWiseDataContributionReport(parameterConfig);

	return Promise.join(
		getTopUrls,
		getPageGroupWiseRevenue,
		getDeviceWiseRevenue,
		getAdNetworkWiseData,
		(topUrls, pageGroupRevenue, deviceWiseRevenue, adNetworkWiseData) => {
			if (topUrls) {
				console.log(`Got Top urls: ${JSON.stringify(topUrls)}\n\n`);
			}

			if (pageGroupRevenue) {
				console.log(`Got page group revenue: ${JSON.stringify(pageGroupRevenue)}\n\n`);
			}

			if (deviceWiseRevenue) {
				console.log(`Got device wise revenue: ${JSON.stringify(deviceWiseRevenue)}\n\n`);
			}

			if (adNetworkWiseData) {
				console.log(`Got ad network wise data: ${JSON.stringify(adNetworkWiseData)}\n\n`);
			}
		}
	).catch(err => {
		console.log(`Error while fetching API data: ${err}`);
	});
}

setTimeout(() => {
	getData();
}, 3000);
