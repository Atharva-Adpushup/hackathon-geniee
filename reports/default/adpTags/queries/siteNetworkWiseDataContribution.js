const { SITE_NETWORK_WISE_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	const isExchangeRate = !!resultData.exchangeRate;

	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT);
		let revenue = utils.toFloat(collectionObject.revenue),
			impressions = collectionObject.impressions,
			isAdNetworkInAggregatedCollection,
			isAdNetworkInDayWiseCollection,
			adNetwork = collectionObject.name.toUpperCase(),
			isAdNetworkDFP = !!(adNetwork === 'DFP'),
			isAdNetworkGeniee = !!(adNetwork === 'GENIEE');

		// This change is done to show 'ADP' network name to end users instead of 'DFP'.
		// NOTE: This change was asked by OPS team and is liable to be removed/modified in future
		// as per their convenience
		if (isAdNetworkDFP) {
			adNetwork = 'ADP';
		}

		if (isAdNetworkGeniee && isExchangeRate) {
			revenue = utils.toFloat(revenue * resultData.exchangeRate);
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

function transformResultData(inputData, exchangeRateData) {
	const resultData = {
			aggregated: {},
			dayWise: {},
			exchangeRate: exchangeRateData.rate
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
				},
				{
					name: '__siteId__',
					type: 'SmallInt',
					value: paramConfig.siteId
				}
			],
			dbQuery = `${SITE_NETWORK_WISE_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			currencyExchangeConfig = {
				base: 'JPY',
				symbols: 'USD'
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig),
			getJPYToUSDExchangeRate = utils.getCurrencyExchangeRate(currencyExchangeConfig);

		console.log(
			`Query for site network wise contribution between: ${paramConfig.fromDate} and ${paramConfig.toDate}`
		);

		return Promise.join(getReportData, getJPYToUSDExchangeRate, (resultData, exchangeRateData) => {
			const isOptionTransform = !!(paramConfig && paramConfig.transform),
				isResultData = !!(resultData && resultData.length),
				isTransformableData = isOptionTransform && isResultData;

			if (!isTransformableData) {
				return resultData;
			}

			return transformResultData(resultData, exchangeRateData);
		});
	}
};
