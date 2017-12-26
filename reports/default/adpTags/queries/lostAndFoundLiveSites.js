const { liveSitesQuery, STRING_DATE_FORMAT } = require('../constants'),
	{ fetchLiveSites } = require('../index'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	const thisWeekData = inputData.thisWeek.data,
		lastWeekData = inputData.lastWeek.data,
		intersectedSites = inputData.combine.intersection,
		unionSites = inputData.combine.union;

	return unionSites.reduce((resultCollecton, siteName) => {
		const isSiteInIntersectedCollection = intersectedSites.indexOf(siteName) > -1,
			siteInThisWeekData = _.find(thisWeekData, { name: siteName }),
			siteInLastWeekData = _.find(lastWeekData, { name: siteName }),
			isSiteFound = !!(!isSiteInIntersectedCollection && siteInThisWeekData && !siteInLastWeekData),
			isSiteLost = !!(!isSiteInIntersectedCollection && siteInLastWeekData && !siteInThisWeekData);
		let siteData;

		if (isSiteInIntersectedCollection) {
			return resultCollecton;
		} else if (isSiteFound) {
			siteData = extend(true, {}, siteInThisWeekData);
			resultCollecton.found.push(siteData);
		} else if (isSiteLost) {
			siteData = extend(true, {}, siteInLastWeekData);
			resultCollecton.lost.push(siteData);
		}

		return resultCollecton;
	}, resultData);
}

function transformResultData(inputData) {
	const resultData = {
			lost: [],
			found: [],
			same: inputData.overall.same.concat([]),
			total: inputData.overall.total,
			dateFormat: extend(true, {}, inputData.overall.dateFormat)
		},
		segregatedData = getSegregatedData(inputData, resultData);

	return segregatedData;
}

module.exports = {
	getData: paramConfig => {
		const isParamConfig = !!paramConfig,
			isThisWeekParams = isParamConfig && paramConfig.thisWeek,
			isLastWeekParams = isParamConfig && paramConfig.lastWeek,
			isParamsThreshold = !!(isParamConfig && paramConfig.threshold),
			isThisWeekFromDate = !!(isThisWeekParams && paramConfig.thisWeek.from),
			isThisWeekToDate = !!(isThisWeekParams && paramConfig.thisWeek.to),
			isLastWeekFromDate = !!(isLastWeekParams && paramConfig.lastWeek.from),
			isLastWeekToDate = !!(isLastWeekParams && paramConfig.lastWeek.to),
			thisWeekConfig = {
				threshold: isParamsThreshold ? paramConfig.threshold : 1000,
				from: isThisWeekFromDate
					? moment(paramConfig.thisWeek.from).format('YYYY-MM-DD')
					: moment()
							.subtract(7, 'days')
							.format('YYYY-MM-DD'),
				to: isThisWeekToDate
					? moment(paramConfig.thisWeek.to).format('YYYY-MM-DD')
					: moment()
							.subtract(1, 'days')
							.format('YYYY-MM-DD')
			},
			lastWeekConfig = {
				threshold: isParamsThreshold ? paramConfig.threshold : 1000,
				from: isLastWeekFromDate
					? moment(paramConfig.lastWeek.from).format('YYYY-MM-DD')
					: moment()
							.subtract(14, 'days')
							.format('YYYY-MM-DD'),
				to: isLastWeekToDate
					? moment(paramConfig.lastWeek.to).format('YYYY-MM-DD')
					: moment()
							.subtract(8, 'days')
							.format('YYYY-MM-DD')
			},
			getThisWeekReportData = fetchLiveSites(thisWeekConfig),
			getLastWeekReportData = fetchLiveSites(lastWeekConfig);

		console.log('Query for lost and found live sites data...');

		return Promise.join(getThisWeekReportData, getLastWeekReportData, (thisWeekReportData, lastWeekReportData) => {
			const resultData = {
					thisWeek: [],
					lastWeek: []
				},
				isOptionTransform = !!(paramConfig && paramConfig.transform),
				isThisWeekReportData = !!(thisWeekReportData && thisWeekReportData.length),
				isLastWeekReportData = !!(lastWeekReportData && lastWeekReportData.length),
				isTransformableData = isOptionTransform && isThisWeekReportData && isLastWeekReportData;

			if (!isTransformableData) {
				return resultData;
			}

			resultData.thisWeek = {
				data: thisWeekReportData.concat([]),
				sites: _.map(thisWeekReportData, 'name')
			};
			resultData.lastWeek = {
				data: lastWeekReportData.concat([]),
				sites: _.map(lastWeekReportData, 'name')
			};
			resultData.combine = {
				intersection: _.intersection(resultData.thisWeek.sites, resultData.lastWeek.sites),
				union: _.union(resultData.thisWeek.sites, resultData.lastWeek.sites)
			};
			const thisWeekDateFormat = {
					from: moment(paramConfig.thisWeek.from).format('ddd, MMM DD'),
					to: moment(paramConfig.thisWeek.to).format('ddd, MMM DD')
				},
				lastWeekDateFormat = {
					from: moment(paramConfig.lastWeek.from).format('ddd, MMM DD'),
					to: moment(paramConfig.lastWeek.to).format('ddd, MMM DD')
				};

			resultData.overall = {
				total: resultData.combine.union.length,
				same: resultData.combine.intersection.map(siteName =>
					_.find(resultData.thisWeek.data, { name: siteName })
				),
				dateFormat: {
					thisWeek: `${thisWeekDateFormat.from} - ${thisWeekDateFormat.to}`,
					lastWeek: `${lastWeekDateFormat.from} - ${lastWeekDateFormat.to}`
				}
			};

			delete resultData.thisWeek.sites;
			delete resultData.lastWeek.sites;

			return transformResultData(resultData);
		});
	}
};
