const Promise = require('bluebird'),
	_ = require('lodash'),
	request = require('request-promise'),
	moment = require('moment'),
	config = require('../configs/config'),
	commonConsts = require('../configs/commonConsts'),
	utils = require('./utils'),
	sqlReportingModule = require('../reports/default/adpTags/index'),
	siteTopUrlsQuery = require('../reports/default/adpTags/queries/siteTopUrls'),
	siteDeviceWiseRevenueContributionQuery = require('../reports/default/adpTags/queries/siteDeviceWiseRevenueContribution'),
	sitePageGroupWiseRevenueContributionQuery = require('../reports/default/adpTags/queries/sitePageGroupWiseRevenueContribution'),
	siteAdNetworkWiseDataContributionQuery = require('../reports/default/adpTags/queries/siteAdNetworkWiseDataContribution'),
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
	isSiteLiveFor7Days = inputDate => {
		return !!(moment().diff(inputDate, 'days') >= 7);
	},
	validateMetricsData = inputData => {
		const isInputData = !!(inputData && inputData.siteId && inputData.lastWeekReport && inputData.thisWeekReport),
			isLastWeekReport = !!(
				isInputData &&
				inputData.lastWeekReport &&
				Object.keys(inputData.lastWeekReport).length &&
				inputData.lastWeekReport.reportData &&
				Object.keys(inputData.lastWeekReport.reportData).length &&
				inputData.lastWeekReport.reportDataNonAggregated &&
				inputData.lastWeekReport.reportDataNonAggregated.length &&
				inputData.lastWeekReport.reportFrom &&
				inputData.lastWeekReport.reportTo
			),
			isThisWeekReport = !!(
				isInputData &&
				inputData.thisWeekReport &&
				Object.keys(inputData.thisWeekReport).length &&
				inputData.thisWeekReport.reportData &&
				Object.keys(inputData.thisWeekReport.reportData).length &&
				inputData.thisWeekReport.reportDataNonAggregated &&
				inputData.thisWeekReport.reportDataNonAggregated.length &&
				inputData.thisWeekReport.reportFrom &&
				inputData.thisWeekReport.reportTo
			),
			thisWeekEarliestDate =
				isThisWeekReport && moment(inputData.thisWeekReport.reportDataNonAggregated[0].report_date),
			isValidSiteData = isSiteLiveFor7Days(thisWeekEarliestDate),
			isValidData = isLastWeekReport && isThisWeekReport && isValidSiteData;

		if (!isValidData) {
			throw new Error('validateMetricsData: Data is invalid');
		}

		return inputData;
	},
	setMetricComparisonData = (inputData, lastWeek, thisWeek) => {
		const comparisonData = utils.getMetricComparison(lastWeek, thisWeek);

		inputData.lastWeek = utils.numberFormatter(lastWeek);
		inputData.lastWeekOriginal = Number(lastWeek);

		inputData.thisWeek = utils.numberFormatter(thisWeek);
		inputData.thisWeekOriginal = Number(thisWeek);

		inputData.percentage = Number(comparisonData.percentage);
		inputData.change = comparisonData.change;
	},
	computeMetricComparison = inputData => {
		const resultData = {
			impressions: {
				lastWeek: 0,
				lastWeekOriginal: 0,
				thisWeek: 0,
				thisWeekOriginal: 0,
				percentage: 0,
				change: false
			},
			revenue: {
				lastWeek: 0,
				lastWeekOriginal: 0,
				thisWeek: 0,
				thisWeekOriginal: 0,
				percentage: 0,
				change: false
			},
			pageViews: {
				lastWeek: 0,
				lastWeekOriginal: 0,
				thisWeek: 0,
				thisWeekOriginal: 0,
				percentage: 0,
				change: false
			},
			cpm: {
				lastWeek: 0,
				lastWeekOriginal: 0,
				thisWeek: 0,
				thisWeekOriginal: 0,
				percentage: 0,
				change: false
			},
			pageCPM: {
				lastWeek: 0,
				lastWeekOriginal: 0,
				thisWeek: 0,
				thisWeekOriginal: 0,
				percentage: 0,
				change: false
			}
		};

		setMetricComparisonData(
			resultData.impressions,
			inputData.lastWeekReport.reportData.totalImpressions,
			inputData.thisWeekReport.reportData.totalImpressions
		);
		setMetricComparisonData(
			resultData.revenue,
			inputData.lastWeekReport.reportData.totalRevenue,
			inputData.thisWeekReport.reportData.totalRevenue
		);
		setMetricComparisonData(
			resultData.pageViews,
			inputData.lastWeekReport.reportData.totalPageviews,
			inputData.thisWeekReport.reportData.totalPageviews
		);
		setMetricComparisonData(
			resultData.cpm,
			inputData.lastWeekReport.reportData.totalCpm,
			inputData.thisWeekReport.reportData.totalCpm
		);
		setMetricComparisonData(
			resultData.pageCPM,
			inputData.lastWeekReport.reportData.totalPageCpm,
			inputData.thisWeekReport.reportData.totalPageCpm
		);

		return resultData;
	},
	aggregateWeekData = rows => {
		let totalImpressions = 0,
			totalRevenue = 0,
			totalPageviews = 0,
			totalCpm = 0,
			totalPageCpm = 0;

		if (!rows.length) {
			return {
				totalImpressions,
				totalRevenue,
				totalPageviews,
				totalCpm: 0,
				totalPageCpm: 0
			};
		}

		_.forEach(rows, row => {
			totalImpressions += row.total_impressions;
			totalRevenue += row.total_revenue;
			totalPageviews += row.total_requests;

			const cpm = row.total_revenue * 1000 / row.total_impressions;
			totalCpm += isNaN(cpm) ? 0 : cpm;

			totalPageCpm += row.total_revenue * 1000 / row.total_requests;
		});

		const totalCpmValue = (totalRevenue / totalImpressions * 1000).toFixed(2);
		return {
			totalImpressions,
			totalRevenue: totalRevenue.toFixed(2),
			totalPageviews,
			totalCpm: isNaN(totalCpmValue) ? 0 : totalCpmValue,
			totalPageCpm: (totalRevenue / totalPageviews * 1000).toFixed(2)
		};
	},
	getSiteReport = payload => {
		const { siteId, select, from, to } = payload;

		return sqlReportingModule.generate({
			select,
			where: { siteid: siteId, from, to, mode: 1 }
		});
	},
	getDay = dayOffset =>
		moment()
			.subtract(dayOffset, 'days')
			.startOf('day'),
	getWeeklyComparisionReport = siteId => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
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
				const thisWeekAggregatedReport = aggregateWeekData(thisWeekReport),
					lastWeekAggregatedReport = aggregateWeekData(lastWeekReport);

				return {
					siteId,
					lastWeekReport: {
						reportData: lastWeekAggregatedReport,
						reportDataNonAggregated: lastWeekReport,
						reportFrom: moment(lastWeekReportParams.from).format('DD-MM'),
						reportTo: moment(lastWeekReportParams.to).format('DD-MM')
					},
					thisWeekReport: {
						reportData: thisWeekAggregatedReport,
						reportDataNonAggregated: thisWeekReport,
						reportFrom: moment(thisWeekReportParams.from).format('DD-MM'),
						reportTo: moment(thisWeekReportParams.to).format('DD-MM')
					}
				};
			});
	},
	getWeeklyMetricsReport = siteId => {
		return getWeeklyComparisionReport(siteId)
			.then(validateMetricsData)
			.then(computeMetricComparison);
	},
	getSiteTopUrlsReport = parameterConfig => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
			config = {
				siteId: parameterConfig.siteId,
				fromDate: parameterConfig.fromDate ? parameterConfig.fromDate : moment(getDay(7)).format(dateFormat),
				toDate: parameterConfig.toDate ? parameterConfig.toDate : moment(getDay(1)).format(dateFormat),
				count: parameterConfig.count ? parameterConfig.count : 10,
				transform: parameterConfig.transform ? parameterConfig.transform : false
			};

		return siteTopUrlsQuery.getData(config);
	},
	getSiteDeviceWiseRevenueContributionReport = parameterConfig => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
			config = {
				siteId: parameterConfig.siteId,
				fromDate: parameterConfig.fromDate ? parameterConfig.fromDate : moment(getDay(7)).format(dateFormat),
				toDate: parameterConfig.toDate ? parameterConfig.toDate : moment(getDay(1)).format(dateFormat),
				transform: parameterConfig.transform ? parameterConfig.transform : false
			};

		return siteDeviceWiseRevenueContributionQuery.getData(config);
	},
	getSitePageGroupWiseRevenueContributionReport = parameterConfig => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
			config = {
				siteId: parameterConfig.siteId,
				fromDate: parameterConfig.fromDate ? parameterConfig.fromDate : moment(getDay(7)).format(dateFormat),
				toDate: parameterConfig.toDate ? parameterConfig.toDate : moment(getDay(1)).format(dateFormat),
				transform: parameterConfig.transform ? parameterConfig.transform : false
			};

		return sitePageGroupWiseRevenueContributionQuery.getData(config);
	},
	getSiteAdNetworkWiseDataContributionReport = parameterConfig => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
			config = {
				siteId: parameterConfig.siteId,
				fromDate: parameterConfig.fromDate ? parameterConfig.fromDate : moment(getDay(7)).format(dateFormat),
				toDate: parameterConfig.toDate ? parameterConfig.toDate : moment(getDay(1)).format(dateFormat),
				transform: parameterConfig.transform ? parameterConfig.transform : false
			};

		return siteAdNetworkWiseDataContributionQuery.getData(config);
	},
	getWeeklyEmailReport = siteId => {
		const dateFormat = commonConsts.REPORT_API.DATE_FORMAT,
			parameterConfig = {
				siteId,
				fromDate: moment(getDay(7)).format(dateFormat),
				toDate: moment(getDay(1)).format(dateFormat),
				transform: true,
				count: 10
			},
			resultData = {
				metricComparison: {},
				topUrls: {},
				pageGroupRevenueContribution: {},
				deviceRevenueContribution: {},
				adNetworkDataContribution: {}
			};

		return getWeeklyMetricsReport(parameterConfig.siteId).then(metricComparison => {
			const getTopUrls = getSiteTopUrlsReport(parameterConfig),
				getPageGroupWiseRevenue = getSitePageGroupWiseRevenueContributionReport(parameterConfig),
				getDeviceWiseRevenue = getSiteDeviceWiseRevenueContributionReport(parameterConfig),
				getAdNetworkWiseData = getSiteAdNetworkWiseDataContributionReport(parameterConfig);

			return Promise.join(
				getTopUrls,
				getPageGroupWiseRevenue,
				getDeviceWiseRevenue,
				getAdNetworkWiseData,
				(topUrls, pageGroupRevenue, deviceWiseRevenue, adNetworkWiseData) => {
					resultData.metricComparison = metricComparison;
					resultData.topUrls = topUrls;
					resultData.pageGroupRevenueContribution = pageGroupRevenue;
					resultData.deviceRevenueContribution = deviceWiseRevenue;
					resultData.adNetworkDataContribution = adNetworkWiseData;

					return resultData;
				}
			);
		});
	};

module.exports = {
	queryResultProcessing,
	getWeeklyComparisionReport,
	getWeeklyMetricsReport,
	getWeeklyEmailReport,
	getSiteTopUrlsReport,
	getSiteDeviceWiseRevenueContributionReport,
	getSitePageGroupWiseRevenueContributionReport,
	getSiteAdNetworkWiseDataContributionReport
};
