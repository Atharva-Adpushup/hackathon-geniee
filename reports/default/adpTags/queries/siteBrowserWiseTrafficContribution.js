const { SITE_BROWSER_LEVEL_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getSegregatedData(inputData, resultData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			siteId = collectionObject.siteid,
			browserName = collectionObject.name.toUpperCase(),
			date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT);
		let pageViews = collectionObject.hits,
			isNameInAggregatedCollection = !!resultCollecton.aggregated.hasOwnProperty(browserName),
			isDateInDayWiseCollection,
			isNameInBrowserWiseCollection = !!(
				resultCollecton.browserWise.hasOwnProperty(browserName) && resultCollecton.browserWise[browserName]
			),
			isSiteInBrowserWiseCollection;

		if (!isNameInAggregatedCollection) {
			resultCollecton.aggregated[browserName] = pageViews;
		} else {
			resultCollecton.aggregated[browserName] += pageViews;
		}

		isDateInDayWiseCollection = !!(resultCollecton.dayWise.hasOwnProperty(date) && resultCollecton.dayWise[date]);
		if (!isDateInDayWiseCollection) {
			resultCollecton.dayWise[date] = {};
		}
		resultCollecton.dayWise[date][browserName] = pageViews;

		if (!isNameInBrowserWiseCollection) {
			resultCollecton.browserWise[browserName] = {};
		}

		isSiteInBrowserWiseCollection = !!(
			resultCollecton.browserWise[browserName].hasOwnProperty(siteId) &&
			resultCollecton.browserWise[browserName][siteId]
		);
		if (!isSiteInBrowserWiseCollection) {
			resultCollecton.browserWise[browserName][siteId] = {
				name: browserName,
				pageViews
			};
		} else {
			resultCollecton.browserWise[browserName][siteId].pageViews += pageViews;
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
			browserWise: {}
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
					type: 'Int',
					value: paramConfig.siteId
				}
			],
			dbQuery = `${SITE_BROWSER_LEVEL_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig);

		console.log(
			`Query for site browser wise contribution between: ${paramConfig.fromDate} and ${paramConfig.toDate}`
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
