const synService = require('./services/genieeAdSyncService/cdnSyncService/cdnSyncConsumer'),
	{ couchbaseService } = require('node-utils'),
	_ = require('lodash'),
	config = require('./configs/config'),
	sqlReportingModule = require('./reports/default/adpTags/index'),
	dbHelper = couchbaseService(
		`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
		config.couchBase.DEFAULT_BUCKET,
		config.couchBase.DEFAULT_BUCKET_PASSWORD
	);

function getSiteData(siteId) {
	let query = `Select a.* from ${config.couchBase.DEFAULT_BUCKET} a where meta().id like 'site::${siteId}'`;
	return dbHelper.queryDB(query);
}

function getPagegroupNames(data) {
	return data.cmsInfo && data.cmsInfo.pageGroups.length
		? _.map(data.cmsInfo.pageGroups, 'pageGroup')
		: Promise.reject('No Pagegroup found');
}

function fetchFromSQL(siteid, pagegroups) {
	let params = {
		select: ['total_revenue', 'total_requests', 'report_date', 'siteid'],
		where: {
			siteid: siteid,
			pagegroup: pagegroups,
			mode: 1
		},
		groupBy: ['variation']
	};
	return sqlReportingModule.generate(params);
}

function processData(response) {
	if (!response && !response.length) {
		return Promise.reject('No response');
	}
	let output = {
			pagegroups: {}
		},
		pageGroupWiseData = _.groupBy(response, 'name');
	_.forEach(pageGroupWiseData, (pagegroupData, pagegroupName) => {
		let variationWiseData = _.groupBy(pagegroupData, 'variation_id'),
			innerObj = {};
		_.forEach(variationWiseData, (singleVariationData, variationId) => {
			innerObj[variationId] = {
				pageRPM: 0,
				pageViews: 0, // total_requests
				total_revenue: 0
			};
			singleVariationData.forEach(row => {
				innerObj[variationId].pageViews += parseInt(row['total_requests']);
				innerObj[variationId].total_revenue += parseFloat(row['total_revenue']);
			});

			let isInvalidRevenue = !!(
				innerObj[variationId].total_revenue == 0 ||
				innerObj[variationId].total_revenue == NaN ||
				innerObj[variationId].total_revenue == Infinity
			);

			innerObj[variationId].total_revenue = isInvalidRevenue ? 0 : innerObj[variationId].total_revenue;

			// CPM = Revenue * 1000 / Impressions
			innerObj[variationId].pageRPM =
				isInvalidRevenue || innerObj[variationId].pageViews == 0
					? 0
					: Number(innerObj[variationId].total_revenue * 1000 / innerObj[variationId].pageViews);

			delete innerObj[variationId].total_revenue;
		});
		output.pagegroups[pagegroupName] = {};
		output.pagegroups[pagegroupName].variations = innerObj;
	});
	return Promise.resolve(output);
}

function init(site) {
	return getSiteData(site)
		.then(response => {
			if (response && response.length) {
				return [response[0].siteId, getPagegroupNames(response[0])];
			}
			return Promise.reject('No site data found');
		})
		.spread((siteId, pagegroups) => fetchFromSQL(siteId, pagegroups))
		.then(processData)
		.catch(err => {
			debugger;
		});
}

init(25019).then(data => {
	console.log(data);
});

/**
 * PAGE RPM -- (Revenue / Pageviews) * 1000
 * Revenue = RPM * Pageviews / 1000
 */
