const { STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT),
			adNetwork = collectionObject.display_name.toUpperCase(),
			revenue = utils.toFloat(collectionObject.total_revenue),
			impressions = collectionObject.total_impressions,
			requests = collectionObject.total_requests;

		let isAdNetworkInAggregatedCollection, isAdNetworkInDayWiseCollection;

		isAdNetworkInAggregatedCollection = !!(
			resultCollecton.aggregated.hasOwnProperty(adNetwork) && resultCollecton.aggregated[adNetwork]
		);
		if (!isAdNetworkInAggregatedCollection) {
			resultCollecton.aggregated[adNetwork] = {
				revenue,
				impressions,
				requests
			};
		} else {
			resultCollecton.aggregated[adNetwork].revenue = utils.toFloat(
				resultCollecton.aggregated[adNetwork].revenue + revenue
			);
			resultCollecton.aggregated[adNetwork].impressions += impressions;
			resultCollecton.aggregated[adNetwork].requests += requests;

			// Calculate CPM for aggregated data
			const aggregatedImpressions = resultCollecton.aggregated[adNetwork].impressions,
				aggregatedRevenue = resultCollecton.aggregated[adNetwork].revenue;
			let aggregatedCpm = utils.toFloat(aggregatedRevenue / aggregatedImpressions * 1000);
			aggregatedCpm = isNaN(aggregatedCpm) ? 0 : aggregatedCpm;
			resultCollecton.aggregated[adNetwork].cpm = aggregatedCpm;
		}

		isAdNetworkInDayWiseCollection = !!(
			resultCollecton.dayWise.hasOwnProperty(adNetwork) && resultCollecton.dayWise[adNetwork]
		);
		if (!isAdNetworkInDayWiseCollection) {
			resultCollecton.dayWise[adNetwork] = {};
		}
		resultCollecton.dayWise[adNetwork][date] = {
			revenue,
			impressions,
			requests,
			cpm: utils.toFloat(revenue / impressions * 1000)
		};

		return resultCollecton;
	}, resultData);
}

function computeContribution(inputData) {
	const aggregatedDataKeys = Object.keys(inputData.aggregated),
		totalRevenue = aggregatedDataKeys.reduce((accumulator, dataKeyItem) => {
			const dataValue = inputData.aggregated[dataKeyItem].revenue;

			return utils.toFloat(accumulator + dataValue);
		}, 0);

	aggregatedDataKeys.forEach(dataKeyItem => {
		const dataValue = inputData.aggregated[dataKeyItem].revenue;
		let revenueContribution = utils.toFloat(dataValue / totalRevenue * 100);

		inputData.contribution.revenue[dataKeyItem] = revenueContribution;
	});

	return inputData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			dayWise: {},
			contribution: {
				revenue: {}
			}
		},
		segregatedData = getSegregatedData(inputData, resultData),
		finalResultData = computeContribution(segregatedData);

	return segregatedData;
}

module.exports = {
	getData: paramConfig => {
		const sqlReportConfig = {
			select: ['total_revenue', 'total_requests', 'total_impressions', 'report_date', 'siteid', 'ntwid'],
			where: {
				siteid: paramConfig.siteId,
				from: paramConfig.fromDate,
				to: paramConfig.toDate
			},
			groupBy: ['ntwid']
		};
		console.log(`Query for site adNetwork wise data contribution: ${paramConfig.siteId}`);

		return sqlReportModule.generate(sqlReportConfig).then(resultData => {
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
