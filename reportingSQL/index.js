const Promise = require('bluebird'),
	_ = require('lodash'),
	dbHelper = require('../reports/default/apex/vendor/mssql/dbHelper'),
	{ fetchSectionQuery } = require('./constants'),
	queryHelper = require('./queryHelper');

function checkParameters(data) {
	if (!data || !data.select || !data.select.length) {
		return Promise.reject('Invalid query parameters');
	}
	return Promise.resolve();
}

function executeQuery(params) {
	return dbHelper.queryDB(params);
}

function getId(key, value, type, siteid) {
	let inputParameters = [
		{
			name: key,
			type: type,
			value: value
		},
		{
			name: '__siteid__',
			type: 'INT',
			value: siteid
		}
	];
	return executeQuery({
		inputParameters: inputParameters.concat([]),
		query: fetchSectionQuery
	}).then(response => (_.isArray(response) && response.length ? response[0].axsid : false));
}

function whereWrapper(data) {
	let promises = {};

	// find section Id
	data.hasOwnProperty('section')
		? (promises.axsid = getId('__sec_key__', data.section, 'NVARCHAR', data.siteid))
		: null;
	// find variation Id
	data.hasOwnProperty('variation') ? (promises.axvid = getVariationId(data.variation)) : null;
	// find pagegroup Id
	data.hasOwnProperty('pagegroup') ? (promises.axpgid = getPagegroupId(data.pagegroup)) : null;

	return Promise.props(promises).then(response => {
		console.log(response);
	});
}

function queryBuilder(data) {
	return whereWrapper(data.where)
		.then(() => queryHelper.select(data.select))
		.then(() => queryHelper.from())
		.then(() => queryHelper.__groupBy(data.groupBy))
		.then(() => queryHelper.generateCompleteQuery());
}

function init(data) {
	return checkParameters(data)
		.then(() => queryBuilder(data))
		.then(query => {
			console.log(query);
		});
}

// init({
// 	select: ['report_date', 'siteid', 'total_impressions', 'total_xpath_miss', 'total_cpm'],
// 	where: {
// 		from: '2017-03-03',
// 		to: '2017-03-05',
// 		axpgid: 'DESKTOP',
// 		axvid: '1',
// 		axsid: '05f900bf0f7f56664b14395de8c57c9b',
// 		siteid: '13372'
// 	}
// });

getSectionId('05f900bf0f7f56664b14395de8c57c9b', '13372');
