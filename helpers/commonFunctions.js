const Promise = require('bluebird');
const lodash = require('lodash');

function createAggregateNonAggregateObjects(dataset, key, container) {
	let innerObj = {};
	lodash.forEach(dataset, (nonAggregateDataset, identifier) => {
		innerObj[identifier] = {
			aggregate: {
				total_xpath_miss: 0,
				total_impressions: 0,
				total_revenue: 0, // change this to -1
				total_cpm: 0 // change this to -1
			},
			nonAggregate: nonAggregateDataset
		};
		nonAggregateDataset.forEach(row => {
			innerObj[identifier].aggregate.total_xpath_miss += parseInt(row['total_xpath_miss']);
			innerObj[identifier].aggregate.total_impressions += parseInt(row['total_impressions']);
			innerObj[identifier].aggregate.total_revenue += parseFloat(row['total_revenue']);
		});
		// Rounding off
		innerObj[identifier].aggregate.total_revenue = Number(innerObj[identifier].aggregate.total_revenue).toFixed(3);
		// CPM = Revenue * 1000 / Impressions --> rounding off to 2 decimal places
		innerObj[identifier].aggregate.total_cpm = Number(
			innerObj[identifier].aggregate.total_revenue * 1000 / innerObj[identifier].aggregate.total_impressions
		).toFixed(3);
	});
	container[key] = innerObj;
}

function queryResultProcessing(resultset) {
	let pageGroupWiseResult = lodash.groupBy(resultset, 'name');
	let variationWiseResult = lodash.groupBy(resultset, 'variation_id');
	let sectionWiseResult = lodash.groupBy(resultset, 'section_md5');
	let reporting = {
		pagegroups: {},
		variations: {},
		sections: {}
	};
	createAggregateNonAggregateObjects(pageGroupWiseResult, 'pagegroups', reporting);
	createAggregateNonAggregateObjects(variationWiseResult, 'variations', reporting);
	createAggregateNonAggregateObjects(sectionWiseResult, 'sections', reporting);
	return Promise.resolve(reporting);
}

module.exports = { queryResultProcessing };
