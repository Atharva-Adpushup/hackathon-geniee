const { GLOBAL_METRICS_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT);
		let revenue = utils.toFloat(collectionObject.revenue),
			impressions = collectionObject.impressions,
			pageViews = collectionObject.total_page_views;

		resultCollecton.aggregated.revenue = utils.toFloat(resultCollecton.aggregated.revenue + revenue);
		resultCollecton.aggregated.impressions += impressions;
		resultCollecton.aggregated.pageViews += pageViews;

		// Calculate CPM for aggregated data
		const aggregatedImpressions = resultCollecton.aggregated.impressions,
			aggregatedRevenue = resultCollecton.aggregated.revenue;
		let aggregatedCpm = utils.toFloat(aggregatedRevenue / aggregatedImpressions * 1000);
		aggregatedCpm = isNaN(aggregatedCpm) ? 0 : aggregatedCpm;

		resultCollecton.aggregated.cpm = aggregatedCpm;

		resultCollecton.dayWise[date] = {
			revenue,
			impressions,
			pageViews,
			cpm: utils.toFloat(revenue / impressions * 1000)
		};

		return resultCollecton;
	}, resultData);
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {
				revenue: 0,
				impressions: 0,
				pageViews: 0,
				cpm: 0
			},
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
			dbQuery = `${GLOBAL_METRICS_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig);

		console.log(`Query for global metrics contribution between: ${paramConfig.fromDate} and ${paramConfig.toDate}`);

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
