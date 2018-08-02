const Promise = require('bluebird'),
	_ = require('lodash'),
	dbHelper = require('../common/mssql/dbhelper'),
	{ fetchSectionQuery, fetchVariationQuery, fetchPagegroupQuery, liveSitesQuery } = require('./constants'),
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
	if (
		!data ||
		!data.select ||
		!data.select.length ||
		checkWhere(data.where) ||
		((data.where.hasOwnProperty('section') || (data.groupBy && data.groupBy.indexOf('section') != -1)) &&
			data.select.indexOf('total_requests') != -1) // if level is section then there is no point of pageviews
	) {
		return Promise.reject('Invalid query parameters');
	}
	return Promise.resolve();
}

function executeQuery(params) {
	return dbHelper.queryDB(params);
}

function setDeviceType(value) {
	// 0=Unknown, 1=Mobile/Tablet, 2=PC, 3=Connected TV, 4=Phone, 5=Tablet, 6=Connected Device, 7=Set Top Box
	let response = 2;
	switch (value) {
		case 'DESKTOP':
			response = 2;
			break;
		case 'MOBILE':
			response = 4;
			break;
		case 'TABLET':
			response = 5;
			break;
		case 'CONNECTED TV':
			response = 3;
			break;
		case 'SET TOP BOX':
			response = 7;
			break;
		case 'UNKNOWN':
			response = 0;
			break;
	}
	return response;
}

function setNetworkType(value) {
	/* 1 brealtime, 2 springserve, 3 adsense, 4 dfp, 5 adx */
	let response = [];
	switch (value) {
		case 'ADSENSE':
			response.push(3);
			break;
		case 'ADX':
			response.push(5);
			break;
		case 'DFP':
			response.push(4);
			break;
		case 'ADP TAGS':
			response.push(1, 2, 4);
			break;
		case 'BREALTIME':
			response.push(1);
			break;
		case 'SPRINGSERVE':
			response.push(2);
			break;
	}
	return response;
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
				case 'ntwid':
					columns[key] = 'display_name';
			}
		});
	}
	return columns;
}

function whereWrapper(data, qs) {
	data.hasOwnProperty('section') ? (data.section_md5 = data.section) : null;
	data.hasOwnProperty('variation') ? (data.variation_id = data.variation) : null;
	data.hasOwnProperty('pagegroup') ? (data.name = data.pagegroup) : null;
	data.hasOwnProperty('device_type') ? (data.device_type = setDeviceType(data.device_type)) : null;
	data.hasOwnProperty('ntwid') ? (data.ntwid = setNetworkType(data.ntwid)) : null;

	delete data.section;
	delete data.variation;
	delete data.pagegroup;

	return qs.where(data);
}

function orderByWrapper(data, qs) {
	return qs.orderBy(setCorrectColumnNames(data));
}

function groupByWrapper(data, qs) {
	return qs.groupBy(setCorrectColumnNames(data));
}

function selectWrapper(selectData, groupByData, qs) {
	let flag = _.isArray(groupByData) && groupByData.length && groupByData.indexOf('section') != -1 ? true : false;
	selectData.indexOf('ntwid') != -1
		? (selectData.push('display_name'), (selectData = selectData.filter(ele => ele != 'ntwid')))
		: null;
	return qs.select(selectData, flag);
}

function queryBuilder(data) {
	let qs = queryHelper();
	return whereWrapper(data.where, qs)
		.then(() => selectWrapper(data.select, data.groupBy, qs))
		.then(() => groupByWrapper(data.groupBy, qs))
		.then(() => qs.from())
		.then(() => orderByWrapper(data.orderBy, qs))
		.then(() => qs.generateCompleteQuery());
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

function fetchLiveSites(params) {
	return executeQuery({
		query: liveSitesQuery,
		inputParameters: [
			{
				name: '__from__',
				type: 'DATE',
				value: params.from
			},
			{
				name: '__to__',
				type: 'DATE',
				value: params.to
			},
			{
				name: '__threshold__',
				type: 'INT',
				value: params.threshold
			}
		]
	});
}

function fetchMediationData(params) {
	return executeQuery({
		query: '',
		inputParameters: [
			{
				name: '__siteid__',
				type: 'INT',
				value: params.siteId
			},
			{
				name: '__country__',
				type: 'NVARCHAR',
				value: params.country
			}
		]
	});
}

/*
total_impressions ----> total_ad_requests
total_requests ----> total_pageviews
device_type ---> device_type
display_name ---> network
*/

// let moment = require('moment');

// let params = {
// 	select: ['total_revenue', 'total_requests', 'report_date', 'siteid'],
// 	where: {
// 		siteid: 35498,
// 		pagegroup: ['HOME', 'PAGE', 'POST'],
// 		mode: 1,
// 		from: moment()
// 			.subtract(3, 'days')
// 			.format('YYYY-MM-DD'),
// 		to: moment().format('YYYY-MM-DD')
// 	},
// 	groupBy: ['variation']
// };

// generate(params)
// 	.then(response => {
// 		debugger;
// 	})
// 	.catch(err => {
// 		debugger;
// 	});

module.exports = { generate, getPVS, executeQuery, fetchLiveSites, fetchMediationData };
