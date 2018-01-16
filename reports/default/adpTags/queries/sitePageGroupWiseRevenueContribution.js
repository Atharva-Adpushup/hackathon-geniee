const { SITE_PAGEGROUP_WISE_REVENUE_CONTRIBUTION, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT),
			pageGroup = collectionObject.name.toUpperCase(),
			revenue = utils.toFloat(collectionObject.revenue_after_cut);

		let isPageGroupInAggregatedCollection, isPageGroupInDayWiseCollection;

		isPageGroupInAggregatedCollection = !!(
			resultCollecton.aggregated.hasOwnProperty(pageGroup) && resultCollecton.aggregated[pageGroup]
		);
		if (!isPageGroupInAggregatedCollection) {
			resultCollecton.aggregated[pageGroup] = revenue;
		} else {
			resultCollecton.aggregated[pageGroup] = utils.toFloat(resultCollecton.aggregated[pageGroup] + revenue);
		}

		isPageGroupInDayWiseCollection = !!(
			resultCollecton.dayWise.hasOwnProperty(pageGroup) && resultCollecton.dayWise[pageGroup]
		);
		if (!isPageGroupInDayWiseCollection) {
			resultCollecton.dayWise[pageGroup] = {};
		}
		resultCollecton.dayWise[pageGroup][date] = revenue;

		return resultCollecton;
	}, resultData);
}

function computeContribution(inputData) {
	const aggregatedDataKeys = Object.keys(inputData.aggregated),
		totalRevenue = aggregatedDataKeys.reduce((accumulator, dataKeyItem) => {
			const dataValue = inputData.aggregated[dataKeyItem];

			return utils.toFloat(accumulator + dataValue);
		}, 0);

	aggregatedDataKeys.forEach(dataKeyItem => {
		const dataValue = inputData.aggregated[dataKeyItem];
		let revenueContribution = utils.toFloat(dataValue / totalRevenue * 100);
		const isRevenueContribution = !!(revenueContribution && revenueContribution > 0);

		if (!isRevenueContribution) {
			return true;
		}

		inputData.contribution[dataKeyItem] = revenueContribution;
	});

	return inputData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			dayWise: {},
			contribution: {}
		},
		segregatedData = getSegregatedData(inputData, resultData),
		finalResultData = computeContribution(segregatedData);

	return finalResultData;
}

module.exports = {
	getData: paramConfig => {
		const inputParameterCollection = [
				{
					name: '__siteId__',
					type: 'Int',
					value: paramConfig.siteId
				},
				{
					name: '__fromDate__',
					type: 'Date',
					value: paramConfig.fromDate
				},
				{
					name: '__toDate__',
					type: 'Date',
					value: paramConfig.toDate
				}
			],
			dbQuery = `${SITE_PAGEGROUP_WISE_REVENUE_CONTRIBUTION}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(`Query for site pageGroup wise revenue contribution: ${paramConfig.siteId}`);

		return sqlReportModule.executeQuery(databaseConfig).then(resultData => {
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
