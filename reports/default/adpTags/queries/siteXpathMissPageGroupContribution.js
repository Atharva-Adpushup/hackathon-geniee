const { SITE_XPATH_MISS_PAGEGROUP_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../../common/mssql/databases/centralWareHouse/dbhelper'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			pageGroup = collectionObject.page_group,
			url = collectionObject.url,
			xpathMissCount = collectionObject.total_xpath_miss;

		let isPageGroupInAggregatedCollection = !!resultCollecton.aggregated.hasOwnProperty(pageGroup),
			isPageGroupInPageGroupWiseCollection = !!(
				resultCollecton.pageGroupWise.hasOwnProperty(pageGroup) && resultCollecton.pageGroupWise[pageGroup]
			);

		if (!isPageGroupInAggregatedCollection) {
			resultCollecton.aggregated[pageGroup] = xpathMissCount;
		} else {
			resultCollecton.aggregated[pageGroup] += xpathMissCount;
		}

		if (!isPageGroupInPageGroupWiseCollection) {
			resultCollecton.pageGroupWise[pageGroup] = {
				data: []
			};
		} else {
			resultCollecton.pageGroupWise[pageGroup].data.push({
				url,
				xpathMissCount
			});
		}

		return resultCollecton;
	}, resultData);
}

function computeContribution(inputData) {
	const aggregatedDataKeys = Object.keys(inputData.aggregated),
		totalXpathMiss = aggregatedDataKeys.reduce((accumulator, dataKeyItem) => {
			const dataValue = inputData.aggregated[dataKeyItem];

			return utils.toFloat(accumulator + dataValue);
		}, 0);

	aggregatedDataKeys.forEach(dataKeyItem => {
		const dataValue = inputData.aggregated[dataKeyItem];
		let xpathMissContribution = utils.toFloat(dataValue / totalXpathMiss * 100);
		const isXpathMissContribution = !!(
			typeof xpathMissContribution !== null &&
			!isNaN(xpathMissContribution) &&
			xpathMissContribution >= 0
		);

		if (!isXpathMissContribution) {
			return true;
		}

		inputData.contribution.push({
			[dataKeyItem]: xpathMissContribution
		});
	});

	return inputData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			contribution: [],
			pageGroupWise: {}
		},
		segregatedData = getSegregatedData(inputData, resultData),
		finalResultData = computeContribution(segregatedData);

	return finalResultData;
}

module.exports = {
	getData: paramConfig => {
		const inputParameterCollection = [
				{
					name: '__fromDate__',
					type: 'Date',
					value: paramConfig.fromDate
				},
				{
					name: '__toDate__',
					type: 'Date',
					value: paramConfig.toDate
				},
				{
					name: '__siteId__',
					type: 'SmallInt',
					value: paramConfig.siteId
				},
				{
					name: '__count__',
					type: 'SmallInt',
					value: paramConfig.count
				}
			],
			dbQuery = `${SITE_XPATH_MISS_PAGEGROUP_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.queryDB(databaseConfig);

		console.log(
			`Query for site ${paramConfig.siteId} xpathMiss pageGroup contribution between: ${
				paramConfig.fromDate
			} and ${paramConfig.toDate}`
		);

		return Promise.join(getReportData, resultData => {
			const isOptionTransform = !!(paramConfig && paramConfig.transform),
				isResultData = !!(resultData && resultData.length),
				isTransformableData = isOptionTransform && isResultData;

			if (!isTransformableData) {
				return resultData;
			}

			return transformResultData(resultData);
		});
	}
};
