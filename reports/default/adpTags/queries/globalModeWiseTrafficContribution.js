const { GLOBAL_MODE_WISE_TRAFFIC_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			siteId = collectionObject.siteid,
			siteName = collectionObject.siteName,
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT);
		let pageViews = collectionObject.total_page_views,
			mode = Number(collectionObject.mode),
			isModeInAggregatedCollection = !!resultCollecton.aggregated.hasOwnProperty(mode),
			isDateInDayWiseCollection,
			isModeInSiteWiseCollection = !!(
				resultCollecton.sitewise.hasOwnProperty(mode) && resultCollecton.sitewise[mode]
			),
			isSiteInSiteWiseCollection;

		if (!isModeInAggregatedCollection) {
			resultCollecton.aggregated[mode] = pageViews;
		} else {
			resultCollecton.aggregated[mode] += pageViews;
		}

		isDateInDayWiseCollection = !!(resultCollecton.dayWise.hasOwnProperty(date) && resultCollecton.dayWise[date]);
		if (!isDateInDayWiseCollection) {
			resultCollecton.dayWise[date] = {};
		}
		resultCollecton.dayWise[date][mode] = pageViews;

		if (!isModeInSiteWiseCollection) {
			resultCollecton.sitewise[mode] = {};
		}

		isSiteInSiteWiseCollection = !!(
			resultCollecton.sitewise[mode].hasOwnProperty(siteId) && resultCollecton.sitewise[mode][siteId]
		);
		if (!isSiteInSiteWiseCollection) {
			resultCollecton.sitewise[mode][siteId] = {
				name: siteName,
				pageViews
			};
		} else {
			resultCollecton.sitewise[mode][siteId].pageViews += pageViews;
		}

		return resultCollecton;
	}, resultData);
}

function computeContribution(inputData) {
	const aggregatedDataKeys = Object.keys(inputData.aggregated),
		totalPageViews = aggregatedDataKeys.reduce((accumulator, dataKeyItem) => {
			const dataValue = inputData.aggregated[dataKeyItem];

			return utils.toFloat(accumulator + dataValue);
		}, 0);

	aggregatedDataKeys.forEach(dataKeyItem => {
		const dataValue = inputData.aggregated[dataKeyItem];
		let pageViewsContribution = utils.toFloat(dataValue / totalPageViews * 100);
		const isPageViewsContribution = !!(
			typeof pageViewsContribution !== null &&
			!isNaN(pageViewsContribution) &&
			pageViewsContribution >= 0
		);

		if (!isPageViewsContribution) {
			return true;
		}

		inputData.contribution.push({
			[dataKeyItem]: pageViewsContribution
		});
	});

	return inputData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			dayWise: {},
			contribution: [],
			sitewise: {}
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
				}
			],
			dbQuery = `${GLOBAL_MODE_WISE_TRAFFIC_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig);

		console.log(
			`Query for global mode wise contribution between: ${paramConfig.fromDate} and ${paramConfig.toDate}`
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
