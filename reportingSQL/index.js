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

function whereWrapper(data) {
	data.hasOwnProperty('section') ? (data.section_md5 = data.section) : null;
	data.hasOwnProperty('variation') ? (data.variation_id = data.variation) : null;
	data.hasOwnProperty('pagegroup') ? (data.name = data.pagegroup) : null;

	delete data.section;
	delete data.variation;
	delete data.pagegroup;

	return queryHelper.where(data);
}

function setCorrectColumnNames(data) {
	let columns = _.isArray(data) && data.length ? data.concat([]) : false;
	if (columns) {
		_.forEach(columns, (value, key) => {
			switch (value) {
				case 'section':
					columns[key] = 'section_md5';
					break;
				case 'variation':
					columns[key] = 'variation_id';
					break;
				case 'pagegroup':
					columns[key] = 'name';
					break;
			}
		});
	}
	return columns;
}

function orderByWrapper(data) {
	return queryHelper.orderBy(setCorrectColumnNames(data));
}

function groupByWrapper(data) {
	return queryHelper.groupBy(setCorrectColumnNames(data));
}

function selectWrapper(selectData, groupByData) {
	let flag = _.isArray(groupByData) && groupByData.length && groupByData.indexOf('section') != -1 ? true : false;
	return queryHelper.select(selectData, flag);
}

function queryBuilder(data) {
	return whereWrapper(data.where)
		.then(() => selectWrapper(data.select, data.groupBy))
		.then(() => groupByWrapper(data.groupBy))
		.then(() => queryHelper.from())
		.then(() => orderByWrapper(data.orderBy))
		.then(() => queryHelper.generateCompleteQuery());
}

function init(data) {
	return checkParameters(data)
		.then(() => queryBuilder(data))
		.then(queryWithParameters => executeQuery(queryWithParameters))
		.catch(err => {
			let message = err.message || err;
			return Promise.reject(message);
		});
}

function getQuery(type) {
	let query;
	if (type == 1) {
		query = fetchPagegroupQuery;
	} else if (type == 2) {
		query = fetchVariationQuery;
	} else if (type == 3) {
		query = fetchSectionQuery;
	}
	return query;
}

function getPVS(siteid, type) {
	return executeQuery({
		query: getQuery(type),
		inputParameters: [
			{
				name: '__siteid__',
				type: 'INT',
				value: siteid
			}
		]
	});
}

// init({
// 	select: ['report_date', 'siteid', 'total_impressions', 'total_xpath_miss', 'total_cpm', 'device_type'],
// 	where: {
// 		// section: '429e5150-e40b-4afb-b165-93b8bde3cf21',
// 		siteid: 28822,
// 		variation: '2e68228f-84da-415e-bfcf-bfcf67c87570',
// 		pagegroup: 'MIC',
// 		from: '2017-09-01',
// 		to: '2017-09-10',
// 		device_type: 4
// 	},
// 	groupBy: ['section']
// 	// orderBy: ['variation']
// });

module.exports = { init, getPVS };
