const pageViewsModule = require('./service');
const dataConfig = {
	mode: 1,
	siteId: 25110,
	startDate: '2017-04-01',
	endDate: '2017-04-30'
};
console.log(`SiteId: ${dataConfig.siteId}`);

pageViewsModule.getPageViews(dataConfig)
	.then(console.log)
	.catch((err) => {
		console.log(err);
	});
