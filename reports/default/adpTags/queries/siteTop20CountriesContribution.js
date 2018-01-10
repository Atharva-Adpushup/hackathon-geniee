const { SITE_COUNTRIES_PERFORMANCE, STRING_DATE_FORMAT } = require('../constants'),
	sqlReportModule = require('../index'),
	Promise = require('bluebird'),
	moment = require('moment'),
	_ = require('lodash'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function getFirstTenElements(array) {
	let inputData = array.concat([]);

	inputData.splice(10);
	return inputData;
}

function getSegregatedData(inputData, resultData) {
	const rejectedCountryList = ['Unknown'],
		segregatedData = inputData.reduce((resultCollecton, itemObject) => {
			const collectionObject = extend(true, {}, itemObject),
				date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT);
			let pageViews = collectionObject.total_page_views,
				country = collectionObject.country,
				isCountryInRejectList = rejectedCountryList.indexOf(country) > -1,
				isCountryInAggregatedCollection = !!resultCollecton.aggregated.hasOwnProperty(country),
				isDateInDayWiseCollection;

			if (isCountryInRejectList) {
				return resultCollecton;
			}

			if (!isCountryInAggregatedCollection) {
				resultCollecton.aggregated[country] = pageViews;
			} else {
				resultCollecton.aggregated[country] += pageViews;
			}

			isDateInDayWiseCollection = !!(
				resultCollecton.dayWise.hasOwnProperty(date) && resultCollecton.dayWise[date]
			);
			if (!isDateInDayWiseCollection) {
				resultCollecton.dayWise[date] = {};
			}

			resultCollecton.dayWise[date][country] = pageViews;

			return resultCollecton;
		}, resultData),
		aggregatedKeyPairsCollection = _.reduce(
			segregatedData.aggregated,
			(accumulator, value, property) => {
				const object = {};

				object.pageViews = value;
				object.country = property;
				accumulator.push(object);
				return accumulator;
			},
			[]
		),
		pageViewsSortedAggregatedCollection = _.orderBy(aggregatedKeyPairsCollection, ['pageViews'], ['desc']),
		isAggregatedCollectionGreaterThanTen =
			pageViewsSortedAggregatedCollection && pageViewsSortedAggregatedCollection.length > 20,
		filteredAggregatedCollection = isAggregatedCollectionGreaterThanTen
			? getFirstTenElements(pageViewsSortedAggregatedCollection)
			: pageViewsSortedAggregatedCollection;

	segregatedData.aggregated = filteredAggregatedCollection.concat([]);
	return segregatedData;
}

function computeContribution(inputData) {
	const aggregatedData = inputData.aggregated,
		totalPageViews = aggregatedData.reduce((accumulator, dataItemObject) => {
			const pageViews = dataItemObject.pageViews;

			return utils.toFloat(accumulator + pageViews);
		}, 0);

	aggregatedData.forEach(dataItemObject => {
		let pageViews = dataItemObject.pageViews,
			country = dataItemObject.country,
			pageViewsContribution = utils.toFloat(pageViews / totalPageViews * 100);
		const isPageViewsContribution = !!(
			typeof pageViewsContribution !== null &&
			!isNaN(pageViewsContribution) &&
			pageViewsContribution >= 0
		);

		if (!isPageViewsContribution) {
			return true;
		}

		inputData.contribution.push({
			[country]: pageViewsContribution
		});
	});

	return inputData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {},
			dayWise: {},
			contribution: []
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
					name: '__count__',
					type: 'SmallInt',
					value: paramConfig.count ? paramConfig.count : 21
				},
				{
					name: '__siteId__',
					type: 'SmallInt',
					value: paramConfig.siteId
				}
			],
			dbQuery = `${SITE_COUNTRIES_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig);

		console.log(`Query for site top 20 countries between: ${paramConfig.fromDate} and ${paramConfig.toDate}`);

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
