const Promise = require('bluebird'),
	_ = require('lodash'),
	dbHelper = require('../reports/default/apex/vendor/mssql/dbHelper'),
	{ fetchSectionQuery, fetchVariationQuery, fetchPagegroupQuery } = require('./constants'),
	queryHelper = require('./queryHelper');

function checkParameters(data) {
	if (!data || !data.select || !data.select.length || !data.where || !data.where.siteid) {
		return Promise.reject('Invalid query parameters');
	}
	return Promise.resolve();
}

function executeQuery(params) {
	return dbHelper.queryDB(params);
}

function getId(key, value, type, query, siteid) {
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
		query: query
	}).then(response => (_.isArray(response) && response.length ? response[0][_.keys(response[0])[0]] : false));
}

function whereWrapper(data) {
	let promises = {};

	// find section Id
	promises.axsid = data.hasOwnProperty('section')
		? getId('__section_md5__', data.section, 'VARCHAR', fetchSectionQuery, data.siteid)
		: Promise.resolve(false);
	// find variation Id
	promises.axvid = data.hasOwnProperty('variation')
		? getId('__variation_id__', data.variation, 'NVARCHAR', fetchVariationQuery, data.siteid)
		: Promise.resolve(false);
	// find pagegroup Id
	promises.axpgid = data.hasOwnProperty('pagegroup')
		? getId('__name__', data.pagegroup, 'NVARCHAR', fetchPagegroupQuery, data.siteid)
		: Promise.resolve(false);

	return Promise.props(promises).then(response => {
		let whereData = _.extend({}, data);
		let sectionNotFound = !!(data.section && !response.axsid);
		let variationNotFound = !!(data.variation && !response.axvid);
		let pagegroupNotFound = !!(data.pagegroup && !response.axpgid);

		if (sectionNotFound || variationNotFound || pagegroupNotFound) {
			return Promise.reject('Invalid where values');
		}
		response.axsid ? (whereData.axsid = response.axsid) : null;
		response.axvid ? (whereData.axvid = response.axvid) : null;
		response.axpgid ? (whereData.axpgid = response.axpgid) : null;

		delete whereData.section;
		delete whereData.variation;
		delete whereData.pagegroup;

		return queryHelper.where(whereData);
	});
}

function queryBuilder(data) {
	return whereWrapper(data.where)
		.then(() => queryHelper.select(data.select))
		.then(() => queryHelper.from())
		.then(() => queryHelper.groupBy(data.groupBy))
		.then(() => queryHelper.generateCompleteQuery());
}

function init(data) {
	return checkParameters(data)
		.then(() => queryBuilder(data))
		.then(queryWithParameters => {
			return executeQuery(queryWithParameters);
		})
		.then(response => {
			console.log(response);
		})
		.catch(err => {
			let message = err.message || err;
			console.log(err);
		});
}

init({
	select: ['report_date', 'siteid', 'total_impressions', 'total_xpath_miss', 'total_cpm'],
	where: {
		// section: '05f900bf0f7f56664b14395de8c57c9b',
		siteid: 28141,
		// variation: '4f0f4b2a_841c_45eb_a6cd_e0796c73517d',
		variation: 'UNDEFINED',
		pagegroup: 'POST',
		from: '2017-06-25',
		to: '2017-07-30'
	}
});
