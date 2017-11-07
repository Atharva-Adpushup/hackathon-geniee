const Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request-promise'),
	moment = require('moment'),
	config = require('../configs/config'),
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
	aggregateWeekData = data => {
		let totalImpressions = 0,
			totalRevenue = 0,
			totalPageviews = 0;

		_.forEach(data.rows, row => {
			totalImpressions += row.total_impressions;
			totalRevenue += row.total_revenue;
			totalPageviews += row.total_requests;
		});

		return {
			totalImpressions,
			totalRevenue,
			totalPageviews,
			totalCpm: Number((totalRevenue * 1000 / totalImpressions).toFixed(2)),
			totalPageCpm: Number((totalRevenue * 1000 / totalPageviews).toFixed(2))
		};
	},
	getSiteReport = site => {
		const { environment } = config,
			baseUrl =
				environment.HOST_ENV === 'development'
					? `${environment.HOST_URL}:${environment.HOST_PORT}`
					: environment.HOST_URL;

		// return request({
		// 	method: 'POST',
		// 	url: `${baseUrl}/user/reports/generate`,
		// 	body: {
		// 		select: ['total_requests', 'total_impressions', 'total_revenue'],
		// 		where: {
		// 			siteid: 31000,
		// 			from: moment()
		// 				.subtract(7, 'days')
		// 				.startOf('day'),
		// 			to: moment()
		// 				.startOf('day')
		// 				.subtract(1, 'day')
		// 		}
		// 	},
		// 	json: true
		// })
		return request({
			method: 'GET',
			url: 'https://jsonplaceholder.typicode.com/posts/1',
			json: true
		})
			.then(data => {
				data = {
					error: false,
					rows: [
						{
							total_impressions: 12131,
							total_requests: 333,
							total_revenue: 12
						}
					]
				};
				return aggregateWeekData(data);
			})
			.catch(err => err);
	};

module.exports = { queryResultProcessing, getSiteReport };
