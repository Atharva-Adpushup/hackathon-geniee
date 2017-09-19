const Promise = require('bluebird'),
	_ = require('lodash'),
	queryHelper = require('queryHelper');

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

function queryBuilder(data) {
	return queryHelper.select(data.select)
	.then(() => queryHelper.whereWrapper(data.where))
	.then(() => queryHelper.groupBy(data.groupBy))
	.then(() => queryHelper.generateCompleteQuery())
}

function init(data) {
	return checkParameters(data)
	.then(() => queryBuilder(data))
	.then(query => {
		console.log(query);
	});
}

init();