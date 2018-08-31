const _ = require('lodash'),
	Promise = require('bluebird'),
	moment = require('moment'),
	sqlReportingModule = require('../default/adpTags/index');

function getPagegroupNames(data) {
	return data && data.pageGroups.length
		? Promise.resolve(_.map(data.pageGroups, 'pageGroup'))
		: Promise.reject('No Pagegroup found');
}

function fetchFromSQL(siteid, pagegroups) {
	let params = {
		select: ['total_revenue', 'total_requests', 'report_date', 'siteid'],
		where: {
			siteid: siteid,
			pagegroup: pagegroups,
			mode: 1,
			from: moment()
				.subtract(3, 'days')
				.format('YYYY-MM-DD'),
			to: moment().format('YYYY-MM-DD')
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
			variations: {}
		},
		pageGroupWiseData = _.groupBy(response, 'name');
	_.forEach(pageGroupWiseData, (pagegroupData, pagegroupName) => {
		let variationWiseData = _.groupBy(pagegroupData, 'variation_id'),
			innerObj = {};
		_.forEach(variationWiseData, (singleVariationData, variationId) => {
			innerObj[variationId] = {
				pageRevenue: 0, // revenue
				pageViews: 0 // total_requests
			};
			singleVariationData.forEach(row => {
				let total_revenue = row['total_revenue'] || 0,
					total_requests = row['total_requests'] || 0;
				innerObj[variationId].pageViews += parseInt(total_requests);
				innerObj[variationId].pageRevenue += parseFloat(total_revenue);
			});

			let isInvalidRevenue = !!(
				innerObj[variationId].pageRevenue == 0 ||
				innerObj[variationId].pageRevenue == NaN ||
				innerObj[variationId].pageRevenue == Infinity
			);

			innerObj[variationId].pageRevenue = isInvalidRevenue ? 0 : innerObj[variationId].pageRevenue;
		});
		output.variations = Object.assign(output.variations, innerObj);
		// output.variations = {
		// 	...output.variations,
		// 	...innerObj
		// };
	});
	return Promise.resolve({
		status: true,
		data: output
	});
}

function getReportData(site) {
	return getPagegroupNames(site.get('cmsInfo'))
		.then(pagegroups => fetchFromSQL(site.get('siteId'), pagegroups))
		.then(processData)
		.catch(err => {
			console.log(err);
			return {
				status: false,
				data: {}
			};
		});
}

function getMediationData(site, data) {
	let params = {
		siteId: data.siteId,
		country: data.country,
		from: moment()
			.subtract(3, 'days')
			.format('YYYY-MM-DD'),
		to: moment().format('YYYY-MM-DD'),
		noCountry: data.noCountry || false
	};
	return getPagegroupNames(site.get('cmsInfo'))
		.then(pagegroups =>
			sqlReportingModule.fetchMediationData({
				...params,
				pagegroups
			})
		)
		.then(processData)
		.catch(err => {
			console.log(err);
			return {
				status: false,
				data: {}
			};
		});
}

module.exports = { getReportData, getMediationData };
