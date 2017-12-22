const { GLOBAL_METRICS_PERFORMANCE, STRING_DATE_FORMAT, PLATFORMS_KEYS } = require('../constants'),
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
			pageViews = collectionObject.total_page_views,
			device = PLATFORMS_KEYS[collectionObject.device_type],
			isDateInDayWiseCollection,
			isDeviceInDayWiseCollection,
			isDateInPlatformDayWiseCollection;

		resultCollecton.aggregated.revenue = utils.toFloat(resultCollecton.aggregated.revenue + revenue);
		resultCollecton.aggregated.impressions += impressions;
		resultCollecton.aggregated.pageViews += pageViews;

		// Calculate CPM for aggregated data
		const aggregatedImpressions = resultCollecton.aggregated.impressions,
			aggregatedRevenue = resultCollecton.aggregated.revenue;
		let aggregatedCpm = utils.toFloat(aggregatedRevenue / aggregatedImpressions * 1000);
		aggregatedCpm = isNaN(aggregatedCpm) ? 0 : aggregatedCpm;
		resultCollecton.aggregated.cpm = aggregatedCpm;

		isDateInDayWiseCollection = !!(resultCollecton.dayWise.hasOwnProperty(date) && resultCollecton.dayWise[date]);
		if (!isDateInDayWiseCollection) {
			resultCollecton.dayWise[date] = {
				revenue,
				impressions,
				pageViews
			};
		} else {
			resultCollecton.dayWise[date].pageViews += pageViews;
			resultCollecton.dayWise[date].impressions += impressions;
			resultCollecton.dayWise[date].revenue = Number(
				(resultCollecton.dayWise[date].revenue + revenue).toFixed(2)
			);
		}
		// Calculate CPM for day wise data
		const dayWiseImpressions = resultCollecton.dayWise[date].impressions,
			dayWiseRevenue = resultCollecton.dayWise[date].revenue;
		let dayWiseCPM = utils.toFloat(dayWiseRevenue / dayWiseImpressions * 1000);
		dayWiseCPM = isNaN(dayWiseCPM) ? 0 : dayWiseCPM;
		resultCollecton.dayWise[date].cpm = dayWiseCPM;

		// PLATFORM DATA COMPUTATION
		isDeviceInDayWiseCollection = !!(
			resultCollecton.platform.hasOwnProperty(device) && resultCollecton.platform[device]
		);
		if (!isDeviceInDayWiseCollection) {
			resultCollecton.platform[device] = {
				aggregated: {
					revenue,
					impressions,
					pageViews
				},
				dayWise: {
					[date]: {
						revenue,
						impressions,
						pageViews
					}
				}
			};
		} else {
			// Aggregated metrics computation
			resultCollecton.platform[device].aggregated.pageViews += pageViews;
			resultCollecton.platform[device].aggregated.impressions += impressions;
			resultCollecton.platform[device].aggregated.revenue = Number(
				(resultCollecton.platform[device].aggregated.revenue + revenue).toFixed(2)
			);

			isDateInPlatformDayWiseCollection = !!(
				resultCollecton.platform[device].dayWise.hasOwnProperty(date) &&
				resultCollecton.platform[device].dayWise[date]
			);
			if (!isDateInPlatformDayWiseCollection) {
				resultCollecton.platform[device].dayWise[date] = {
					revenue,
					impressions,
					pageViews
				};
			}

			// DayWise metrics computation
			resultCollecton.platform[device].dayWise[date].pageViews += pageViews;
			resultCollecton.platform[device].dayWise[date].impressions += impressions;
			resultCollecton.platform[device].dayWise[date].revenue = Number(
				(resultCollecton.platform[device].dayWise[date].revenue + revenue).toFixed(2)
			);
		}

		// Calculate CPM for platform aggregated data
		const platformWiseImpressions = resultCollecton.platform[device].aggregated.impressions,
			platformWiseRevenue = resultCollecton.platform[device].aggregated.revenue;
		let platformWiseCPM = utils.toFloat(platformWiseRevenue / platformWiseImpressions * 1000);
		platformWiseCPM = isNaN(platformWiseCPM) ? 0 : platformWiseCPM;
		resultCollecton.platform[device].aggregated.cpm = platformWiseCPM;

		// Calculate CPM for platform day wise data
		const platformDayWiseImpressions = resultCollecton.platform[device].dayWise[date].impressions,
			platformDayWiseRevenue = resultCollecton.platform[device].dayWise[date].revenue;
		let platformDayWiseCPM = utils.toFloat(platformDayWiseRevenue / platformDayWiseImpressions * 1000);
		platformDayWiseCPM = isNaN(platformDayWiseCPM) ? 0 : platformDayWiseCPM;
		resultCollecton.platform[device].dayWise[date].cpm = platformDayWiseCPM;

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
			dayWise: {},
			platform: {}
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
