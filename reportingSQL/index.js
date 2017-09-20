const Promise = require('bluebird'),
	_ = require('lodash'),
	queryHelper = require('./queryHelper');

function checkParameters(data) {
	if (
		!data
		|| !data.select
		|| !data.select.length
	) {
		return Promise.reject("Invalid query parameters");
	}
	return Promise.resolve();
}

function whereWrapper(data) {
	// let promises = {};

	// // find section Id
	// data.hasOwnProperty('section') ? promises.axsid = getSectionId() : null;
	// // find variation Id
	// data.hasOwnProperty('variation') ? promises.axvid = getVariationId() : null;
	// // find pagegroup Id
	// data.hasOwnProperty('pagegroup') ? promises.axpgid = getPagegroupId() : null;

	// return Promise.props(promises)
	// .then(response => {
	// 	console.log(response);
	// });
	return queryHelper.where(data);
	// return queryHelper.where({
	// 	axpgid: 1,
	// 	axvid: 2,
	// 	axsod: 3
	// });
}

function queryBuilder(data) {
	return whereWrapper(data.where)
	.then(() => queryHelper.select(data.select))
	.then(() => queryHelper.from())
	.then(() => queryHelper.__groupBy(data.groupBy))
	.then(() => queryHelper.generateCompleteQuery())
}

function init(data) {
	return checkParameters(data)
	.then(() => queryBuilder(data))
	.then(query => {
		console.log(query);
	});
}

init({
	select: ['report_date', 'siteid', 'total_impressions', 'total_xpath_miss', 'total_cpm'],
	where: {
		from: '2017-03-03',
		to: '2017-03-05',
		axpgid: 'DESKTOP',
		axvid: '1',
		axsid: '2'
	}
});