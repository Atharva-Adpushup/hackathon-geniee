const Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request-promise'),
	moment = require('moment'),
	config = require('../configs/config'),
	commonConsts = require('../configs/commonConsts'),
	getBaseUrl = () => {
		const env = config.environment,
			baseUrl = env.HOST_ENV === 'development' ? `${env.HOST_URL}:${env.HOST_PORT}` : commonConsts.BASE_URL;

		return baseUrl;
	},
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

		if (!data.rows.length) {
			return {
				totalImpressions,
				totalRevenue,
				totalPageviews,
				totalCpm: 0,
				totalPageCpm: 0
			};
		}

		_.forEach(data.rows, row => {
			totalImpressions += row.total_impressions;
			totalRevenue += row.total_revenue;
			totalPageviews += row.total_requests;
		});

		return {
			totalImpressions,
			totalRevenue: totalRevenue.toFixed(2),
			totalPageviews,
			totalCpm: Number((totalRevenue * 1000 / totalImpressions).toFixed(2)),
			totalPageCpm: Number((totalRevenue * 1000 / totalPageviews).toFixed(2))
		};
	},
	getSiteReport = payload => {
		const baseUrl = getBaseUrl(),
			{ siteId, select, from, to } = payload;

		return request({
			method: 'POST',
			url: `${baseUrl}/user/reports/generate`,
			body: { select, where: { siteid: 31000, from, to } },
			followAllRedirects: true,
			json: true
		})
			.then(data => aggregateWeekData(data))
			.catch(err => err);
	},
	getDay = dayOffset =>
		moment()
			.subtract(dayOffset, 'days')
			.startOf('day'),
	getWeeklyComparisionReport = site => {
		const { siteId } = site,
			dateFormat = commonConsts.REPORT_DATE_FORMAT,
			thisWeekReportParams = {
				siteId,
				from: moment(getDay(7)).format(dateFormat),
				to: moment(getDay(1)).format(dateFormat),
				select: commonConsts.REPORT_API.SELECT_PARAMS
			},
			lastWeekReportParams = {
				siteId,
				from: moment(getDay(14)).format(dateFormat),
				to: moment(getDay(7)).format(dateFormat),
				select: commonConsts.REPORT_API.SELECT_PARAMS
			};

		return getSiteReport(lastWeekReportParams)
			.then(lastWeekReport => [lastWeekReport, getSiteReport(thisWeekReportParams)])
			.spread((lastWeekReport, thisWeekReport) => {
				return {
					siteId,
					lastWeekReport: {
						reportData: lastWeekReport,
						reportFrom: moment(lastWeekReportParams.from).format('DD-MM'),
						reportTo: moment(lastWeekReportParams.to).format('DD-MM')
					},
					thisWeekReport: {
						reportData: thisWeekReport,
						reportFrom: moment(thisWeekReportParams.from).format('DD-MM'),
						reportTo: moment(thisWeekReportParams.to).format('DD-MM')
					}
				};
			});
	};

module.exports = { queryResultProcessing, getWeeklyComparisionReport };
