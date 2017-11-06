const Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request-promise'),
	moment = require('moment'),
	createAggregateNonAggregateObjects = (dataset, key, container) => {
		let innerObj = {};
		_.forEach(dataset, (nonAggregateDataset, identifier) => {
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
			innerObj[identifier].aggregate.total_revenue = Number(innerObj[identifier].aggregate.total_revenue).toFixed(
				3
			);

			let isInvalidRevenue = !!(
				innerObj[identifier].aggregate.total_revenue == 0 ||
				innerObj[identifier].aggregate.total_revenue == NaN ||
				innerObj[identifier].aggregate.total_revenue == Infinity
			);

			innerObj[identifier].aggregate.total_revenue = isInvalidRevenue
				? 0
				: innerObj[identifier].aggregate.total_revenue;

			// CPM = Revenue * 1000 / Impressions --> rounding off to 2 decimal places
			innerObj[identifier].aggregate.total_cpm =
				isInvalidRevenue || innerObj[identifier].aggregate.total_impressions == 0
					? 0
					: Number(
							innerObj[identifier].aggregate.total_revenue *
								1000 /
								innerObj[identifier].aggregate.total_impressions
						).toFixed(3);
		});
		container[key] = innerObj;
	},
	queryResultProcessing = resultset => {
		let pageGroupWiseResult = _.groupBy(resultset, 'name');
		let variationWiseResult = _.groupBy(resultset, 'variation_id');
		let sectionWiseResult = _.groupBy(resultset, 'section_md5');
		let reporting = {
			pagegroups: {},
			variations: {},
			sections: {}
		};
		createAggregateNonAggregateObjects(pageGroupWiseResult, 'pagegroups', reporting);
		createAggregateNonAggregateObjects(variationWiseResult, 'variations', reporting);
		createAggregateNonAggregateObjects(sectionWiseResult, 'sections', reporting);
		return Promise.resolve(reporting);
	},
	getMetricForSite = site => {
		site.siteId = 31000;
		return request({
			method: 'POST',
			uri: `/user/reports/generate`,
			body: {
				siteid: site.siteId,
				from: moment()
					.subtract(7, 'days')
					.startOf('day'),
				to: moment()
					.startOf('day')
					.subtract(1, 'day')
			},
			json: true
		})
			.then(data => {
				console.log(data);
			})
			.catch(err => {
				console.log(err);
			});
	};

module.exports = { queryResultProcessing, getMetricForSite };
