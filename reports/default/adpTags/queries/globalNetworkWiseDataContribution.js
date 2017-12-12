const { GLOBAL_NETWORK_WISE_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT),
			revenue = utils.toFloat(collectionObject.revenue),
			impressions = collectionObject.impressions;

		let isAdNetworkInAggregatedCollection,
			isAdNetworkInDayWiseCollection,
			adNetwork = collectionObject.name.toUpperCase(),
			isAdNetworkDFP = !!(adNetwork === 'DFP');

		// This change is done to show 'ADP' network name to end users instead of 'DFP'.
		// NOTE: This change was asked by OPS team and is liable to be removed/modified in future
		// as per their convenience
		if (isAdNetworkDFP) {
			adNetwork = 'ADP';
		}

		isAdNetworkInAggregatedCollection = !!(
			resultCollecton.aggregated.hasOwnProperty(adNetwork) && resultCollecton.aggregated[adNetwork]
		);
		if (!isAdNetworkInAggregatedCollection) {
			resultCollecton.aggregated[adNetwork] = {
				revenue,
				impressions
			};
		} else {
			resultCollecton.aggregated[adNetwork].revenue = utils.toFloat(
				resultCollecton.aggregated[adNetwork].revenue + revenue
			);
			resultCollecton.aggregated[adNetwork].impressions += impressions;

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
			cpm: utils.toFloat(revenue / impressions * 1000)
		};

		return resultCollecton;
	}, resultData);
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			dayWise: {}
		},
		segregatedData = getSegregatedData(inputData, resultData);

	return segregatedData;
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
				}
			],
			dbQuery = `${GLOBAL_NETWORK_WISE_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(
			`Query for global network wise contribution between: ${paramConfig.fromDate} and ${paramConfig.toDate}`
		);

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
