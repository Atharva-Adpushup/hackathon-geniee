const { TOP_10_SITES_PERFORMANCE, STRING_DATE_FORMAT, PLATFORMS_KEYS } = require('../constants'),
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
	const segregatedData = inputData.reduce((resultCollecton, itemObject) => {
			const collectionObject = extend(true, {}, itemObject),
				date = moment(collectionObject.report_date).format(STRING_DATE_FORMAT),
				siteId = collectionObject.siteid,
				siteUrl = collectionObject.url,
				device = PLATFORMS_KEYS[collectionObject.device_type],
				siteName = collectionObject.name,
				networkId = collectionObject.ntwid,
				isGenieeNetworkId = !!(networkId && Number(networkId) == 6);
			let pageViews = collectionObject.total_page_views || 0,
				impressions = collectionObject.impressions || 0,
				revenue = collectionObject.revenue || 0,
				isSiteIdInAggregatedCollection = !!resultCollecton.aggregated.hasOwnProperty(siteId),
				isDeviceInSiteAggregatedCollection;

			// NOTE: Explicitly stop logic execution if site has 'Geniee' network
			if (isGenieeNetworkId) {
				return resultCollecton;
			}

			if (!isSiteIdInAggregatedCollection) {
				resultCollecton.aggregated[siteId] = {
					pageViews,
					impressions,
					revenue,
					siteName,
					siteUrl,
					siteId
				};
			} else {
				resultCollecton.aggregated[siteId].pageViews += pageViews;
				resultCollecton.aggregated[siteId].impressions += impressions;
				resultCollecton.aggregated[siteId].revenue = Number(
					(resultCollecton.aggregated[siteId].revenue + revenue).toFixed(2)
				);
			}
			// Calculate CPM for aggregated data
			const aggregatedImpressions = resultCollecton.aggregated[siteId].impressions,
				aggregatedRevenue = resultCollecton.aggregated[siteId].revenue;
			let aggregatedCpm = utils.toFloat(aggregatedRevenue / aggregatedImpressions * 1000);
			aggregatedCpm = isNaN(aggregatedCpm) ? 0 : aggregatedCpm;
			resultCollecton.aggregated[siteId].cpm = aggregatedCpm;

			/***** PLATFORM METRICS IMPLEMENTATION *****/
			isDeviceInSiteAggregatedCollection = !!(
				resultCollecton.aggregated[siteId].hasOwnProperty(device) && resultCollecton.aggregated[siteId][device]
			);
			if (!isDeviceInSiteAggregatedCollection) {
				resultCollecton.aggregated[siteId][device] = {
					pageViews,
					impressions,
					revenue
				};
			} else {
				resultCollecton.aggregated[siteId][device].pageViews += pageViews;
				resultCollecton.aggregated[siteId][device].impressions += impressions;
				resultCollecton.aggregated[siteId][device].revenue = Number(
					(resultCollecton.aggregated[siteId][device].revenue + revenue).toFixed(2)
				);
			}
			// Calculate CPM for aggregated data
			const platformImpressions = resultCollecton.aggregated[siteId][device].impressions,
				platformRevenue = resultCollecton.aggregated[siteId][device].revenue;
			let platformCPM = utils.toFloat(platformRevenue / platformImpressions * 1000);
			platformCPM = isNaN(platformCPM) ? 0 : platformCPM;
			resultCollecton.aggregated[siteId][device].cpm = platformCPM;

			return resultCollecton;
		}, resultData),
		aggregatedKeyPairsCollection = _.reduce(
			segregatedData.aggregated,
			(accumulator, metricsObject, property) => {
				const object = extend(true, {}, metricsObject);

				accumulator.push(object);
				return accumulator;
			},
			[]
		),
		// PageViews filtered collection
		pageViewsSortedAggregatedCollection = _.orderBy(aggregatedKeyPairsCollection, ['pageViews'], ['desc']),
		isPageViewsCollectionGreaterThanTen = !!(
			pageViewsSortedAggregatedCollection && pageViewsSortedAggregatedCollection.length > 10
		),
		filteredPageViewsCollection = isPageViewsCollectionGreaterThanTen
			? getFirstTenElements(pageViewsSortedAggregatedCollection)
			: pageViewsSortedAggregatedCollection,
		// Impressions filtered collection
		impressionsSortedAggregatedCollection = _.orderBy(aggregatedKeyPairsCollection, ['impressions'], ['desc']),
		isImpressionCollectionGreaterThanTen = !!(
			impressionsSortedAggregatedCollection && impressionsSortedAggregatedCollection.length > 10
		),
		filteredImpressionsCollection = isImpressionCollectionGreaterThanTen
			? getFirstTenElements(impressionsSortedAggregatedCollection)
			: impressionsSortedAggregatedCollection,
		// Revenue filtered collection
		revenueSortedAggregatedCollection = _.orderBy(aggregatedKeyPairsCollection, ['revenue'], ['desc']),
		isRevenueCollectionGreaterThanTen = !!(
			revenueSortedAggregatedCollection && revenueSortedAggregatedCollection.length > 10
		),
		filteredRevenueCollection = isRevenueCollectionGreaterThanTen
			? getFirstTenElements(revenueSortedAggregatedCollection)
			: revenueSortedAggregatedCollection,
		// CPM filtered collection
		cpmSortedAggregatedCollection = _.orderBy(aggregatedKeyPairsCollection, ['cpm'], ['desc']),
		isCPMCollectionGreaterThanTen = !!(cpmSortedAggregatedCollection && cpmSortedAggregatedCollection.length > 10),
		filteredCPMCollection = isCPMCollectionGreaterThanTen
			? getFirstTenElements(cpmSortedAggregatedCollection)
			: cpmSortedAggregatedCollection;

	segregatedData.aggregated = {
		pageViews: filteredPageViewsCollection.concat([]),
		impressions: filteredImpressionsCollection.concat([]),
		revenue: filteredRevenueCollection.concat([]),
		cpm: filteredCPMCollection.concat([])
	};
	return segregatedData;
}

function transformResultData(inputData) {
	const resultData = {
			aggregated: {}
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
			dbQuery = `${TOP_10_SITES_PERFORMANCE}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			},
			getReportData = sqlReportModule.executeQuery(databaseConfig);

		console.log(`Query for Top 10 sites between: ${paramConfig.fromDate} and ${paramConfig.toDate}`);

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
