const { SITE_DEVICE_WISE_REVENUE_CONTRIBUTION, STRING_DATE_FORMAT, PLATFORMS_KEYS } = require('../constants'),
	sqlReportModule = require('../index'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT),
			device = PLATFORMS_KEYS[collectionObject.device_type],
			revenue = Number(collectionObject.revenue_after_cut.toFixed(2));

		let isDeviceInAggregatedCollection, isDeviceInDayWiseCollection;

		isDeviceInAggregatedCollection = !!(
			resultCollecton.aggregated.hasOwnProperty(device) && resultCollecton.aggregated[device]
		);
		if (!isDeviceInAggregatedCollection) {
			resultCollecton.aggregated[device] = revenue;
		} else {
			resultCollecton.aggregated[device] = Number((resultCollecton.aggregated[device] + revenue).toFixed(2));
		}

		isDeviceInDayWiseCollection = !!(
			resultCollecton.dayWise.hasOwnProperty(device) && resultCollecton.dayWise[device]
		);
		if (!isDeviceInDayWiseCollection) {
			resultCollecton.dayWise[device] = {};
		}
		resultCollecton.dayWise[device][date] = revenue;

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
					type: 'SmallInt',
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
			dbQuery = `${SITE_DEVICE_WISE_REVENUE_CONTRIBUTION}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(`Query for site device wise revenue contribution: ${paramConfig.siteId}`);

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
