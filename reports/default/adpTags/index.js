const Promise = require('bluebird'),
	_ = require('lodash'),
	dbHelper = require('../common/mssql/dbhelper'),
	{ fetchSectionQuery, fetchVariationQuery, fetchPagegroupQuery } = require('./constants'),
	queryHelper = require('./queryHelper');

function checkWhere(where) {
	if (
		!where ||
		!where.siteid ||
		(where.hasOwnProperty('variation') && !_.isArray(where.variation)) ||
		(where.hasOwnProperty('pagegroup') && !_.isArray(where.pagegroup)) ||
		(where.hasOwnProperty('section') && !_.isArray(where.section))
	) {
		return true;
	}
	return false;
}

function checkParameters(data) {
	if (!data || !data.select || !data.select.length || checkWhere(data.where)) {
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

function generate(data) {
	return checkParameters(data)
		.then(() => queryBuilder(data))
		.then(queryWithParameters => {
			return executeQuery(queryWithParameters);
		})
		.catch(err => {
			let message = err.message || err;
			return Promise.reject(message);
		});
}

// function writeFile(name, data) {
// 	return jsonFile.writeFile(`${name}.json`, data, { spaces: 4, flag: 'a' }, err => {
// 		if (err) {
// 			console.log('error');
// 		}
// 		console.log('File saved');
// 		return;
// 	});
// }

// let params = {
// 	select: ['total_xpath_miss', 'total_revenue', 'total_impressions', 'report_date', 'siteid'],
// 	where: {
// 		siteid: 28822,
// 		pagegroup: ['MIC'],
// 		variation: ['2e68228f-84da-415e-bfcf-bfcf67c87570'],
// 		device_type: 2,
// 		ntwid: 2
// 	}
// };

// generate(params)
// 	.then(response => {
// 		debugger;
// 	})
// 	.catch(err => {
// 		debugger;
// 	});

module.exports = { generate, getPVS };
