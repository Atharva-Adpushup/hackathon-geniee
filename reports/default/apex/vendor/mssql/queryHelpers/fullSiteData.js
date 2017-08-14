const { SITE_METRICS_QUERY } = require('../constants/constants'),
	extend = require('extend'),
	dbHelper = require('../dbhelper');

function transformResultData(reportData) {
	const optionsConfig = {
		platform: {
			0: 'UNKNOWN',
			1: 'MOBILE',
			2: 'DESKTOP',
			3: 'CONNECTED_TV',
			4: 'MOBILE',
			5: 'TABLET',
			6: 'CONNECTED_DEVICE',
			7: 'SET_TOP_BOX'
		},
		date: {
			regex: /\d{4}-\d{2}-\d{2}/
		}
	};

	if (!reportData || !reportData.length) { return reportData; }

	return reportData.reduce((accumulator, reportObject) => {
		const isReportObject = !!(reportObject && Object.keys(reportObject).length),
			isRootLevelObject = !!(isReportObject && accumulator.hasOwnProperty(reportObject.siteId) && accumulator[reportObject.siteId]),
			matchedDateValue = reportObject.reportDate.toISOString().match(optionsConfig.date.regex)[0],
			platformValue = (optionsConfig.platform[reportObject.platform]),
			channelName = (`${reportObject.pageGroup}_${platformValue}`),
			isVariationKey = !!(reportObject.variationId),
			variationKey = isVariationKey ? (reportObject.variationId.replace(/_/gi, '-')) : '';

		let isChannelExists, isVariationIdExists, isMatchedDateExists, isDayWisePageViewsExists,
			// Object placeholder variables to improve computation speed and reduce data query time
			sitePageGroupObjectPlaceHolder, siteVariationObjectPlaceHolder, currentVariationObjectPlaceHolder;

		if (!isRootLevelObject) { accumulator[reportObject.siteId] = {pageGroups: {}}; }
		// Cache current page group object
		sitePageGroupObjectPlaceHolder = extend(true, {}, accumulator[reportObject.siteId].pageGroups);

		isChannelExists = !!(isRootLevelObject && sitePageGroupObjectPlaceHolder && sitePageGroupObjectPlaceHolder.hasOwnProperty(channelName));
		if (!isChannelExists) { sitePageGroupObjectPlaceHolder[channelName] = {variations: {}}; }
		// Cache current page group variations object
		siteVariationObjectPlaceHolder = extend(true, {}, sitePageGroupObjectPlaceHolder[channelName].variations);

		isVariationIdExists = !!(isChannelExists && siteVariationObjectPlaceHolder && siteVariationObjectPlaceHolder.hasOwnProperty(variationKey));
		if (!isVariationIdExists) {
			siteVariationObjectPlaceHolder[variationKey] = { dayWisePageViews: {}, days: {}, tracked: { pageViews: 0, click: 0, pageCTR: 0.0, impression: 0 }, click: 0, impression: 0, revenue: 0.0, pageViews: 0, pageRPM: 0.0, pageCTR: 0.0 };
		}
		// Cache current variation object
		currentVariationObjectPlaceHolder = extend(true, {}, siteVariationObjectPlaceHolder[variationKey]);

		isMatchedDateExists = !!(isVariationIdExists && currentVariationObjectPlaceHolder.days &&  currentVariationObjectPlaceHolder.days.hasOwnProperty(matchedDateValue));
		if (!isMatchedDateExists) {
			// TODO: Remove below revenue conversion (divide by 1000)
			// by moving this logic to ads replay side
			let revenue = Number((reportObject.revenue / 1000).toFixed(2)),
				pageViews = reportObject.pageViews,
				trackedPageViews = reportObject.trackedPageViews,
				click = reportObject.clicks,
				trackedClicks = reportObject.trackedClicks,
				pageRPM = Number((revenue / pageViews * 1000).toFixed(2)),
				pageCTR = Number((click / pageViews * 100).toFixed(2)),
				trackedPageCTR = Number((trackedClicks / trackedPageViews * 100).toFixed(2));

			pageRPM = (pageRPM && pageRPM !== Infinity) ? pageRPM : 0.0;
			pageCTR = (pageCTR && pageCTR !== Infinity) ? pageCTR : 0.0;
			trackedPageCTR = (trackedPageCTR && trackedPageCTR !== Infinity) ? trackedPageCTR : 0.0;

			currentVariationObjectPlaceHolder.days[matchedDateValue] = {
				pageViews,
				impression: reportObject.impressions,
				click,
				revenue,
				pageRPM,
				// Below pageCTR metric value is computed by using tracked (Chrome based click tracking) ad clicks and page views.
				// This is done to ensure that pageCTR metric provides a correct value by using tracked clicks and page views metrics.
				pageCTR: trackedPageCTR,
				tracked: {
					pageViews: trackedPageViews,
					click: trackedClicks,
					pageCTR: trackedPageCTR,
					impression: reportObject.trackedImpressions
				}
			};
		}

		isDayWisePageViewsExists = !!(isVariationIdExists && currentVariationObjectPlaceHolder.dayWisePageViews &&  currentVariationObjectPlaceHolder.dayWisePageViews.hasOwnProperty(matchedDateValue));
		if (!isDayWisePageViewsExists) {
			currentVariationObjectPlaceHolder.dayWisePageViews[matchedDateValue] = reportObject.pageViews;
		}

		{
			let revenue = currentVariationObjectPlaceHolder.revenue,
				click = currentVariationObjectPlaceHolder.click,
				trackedClick = currentVariationObjectPlaceHolder.tracked.click,
				impression = currentVariationObjectPlaceHolder.impression,
				trackedImpression = currentVariationObjectPlaceHolder.tracked.impression,
				pageViews = currentVariationObjectPlaceHolder.pageViews,
				trackedPageViews = currentVariationObjectPlaceHolder.tracked.pageViews,
				revenueComputedValue, pageRPMComputedValue,
				pageCTRComputedValue, trackedPageCTRComputedValue;

			click += reportObject.clicks;
			trackedClick += reportObject.trackedClicks;

			impression += reportObject.impressions;
			trackedImpression += reportObject.trackedImpressions;

			pageViews += reportObject.pageViews;
			trackedPageViews += reportObject.trackedPageViews;

			revenueComputedValue = Number((reportObject.revenue / 1000).toFixed(2));
			revenue = Number((revenue + revenueComputedValue).toFixed(2));

			// Computed current metric value
			pageRPMComputedValue = Number((revenue / pageViews * 1000).toFixed(2));
			// Check for boundary cases and convert accordingly
			pageRPMComputedValue = (pageRPMComputedValue && pageRPMComputedValue !== Infinity) ? pageRPMComputedValue : 0.0;

			pageCTRComputedValue = Number((click / pageViews * 100).toFixed(2));
			pageCTRComputedValue = (pageCTRComputedValue && pageCTRComputedValue !== Infinity) ? pageCTRComputedValue : 0.0;
			trackedPageCTRComputedValue = Number((trackedClick / trackedPageViews * 100).toFixed(2));
			trackedPageCTRComputedValue = (trackedPageCTRComputedValue && trackedPageCTRComputedValue !== Infinity) ? trackedPageCTRComputedValue : 0.0;

			// Assign back final computed metric values to variation object
			currentVariationObjectPlaceHolder.revenue = revenue;

			currentVariationObjectPlaceHolder.click = click;
			currentVariationObjectPlaceHolder.tracked.click = trackedClick;

			currentVariationObjectPlaceHolder.impression = impression;
			currentVariationObjectPlaceHolder.tracked.impression = trackedImpression;

			currentVariationObjectPlaceHolder.pageViews = pageViews;
			currentVariationObjectPlaceHolder.tracked.pageViews = trackedPageViews;

			currentVariationObjectPlaceHolder.pageRPM = pageRPMComputedValue;
			currentVariationObjectPlaceHolder.pageCTR = trackedPageCTRComputedValue;
			currentVariationObjectPlaceHolder.tracked.pageCTR = trackedPageCTRComputedValue;
		}

		// Assign back cached objects to computed data
		siteVariationObjectPlaceHolder[variationKey] = extend(true, {}, currentVariationObjectPlaceHolder);
		sitePageGroupObjectPlaceHolder[channelName].variations = extend(true, {}, siteVariationObjectPlaceHolder);
		accumulator[reportObject.siteId].pageGroups = extend(true, {}, sitePageGroupObjectPlaceHolder);

		return accumulator;
	}, {});
}

module.exports = {
	getMetricsData: (paramConfig) => {
		const inputParameterCollection = [
				//---------------------NOTE---------------------//
				// Please ensure that below mentioned 'type' property value
				// is a case sensitive sql (sql is 'mssql' module) data type such as 'VarChar', 'SmallInt', 'Date' etc.
				// These values are supported because dbHelper module identifies every 'type' property value
				// as sql data type key and gets its corresponding value as mentioned in following code example:
				// ```return sqlInstance.input(paramObject.name, sql[paramObject.type], paramObject.value);```
				// Please refer to https://www.npmjs.com/package/mssql#data-types for complete reference of supported data types
				{
					name: '__mode__',
					type: 'SmallInt',
					value: paramConfig.mode
				},
				{
					name: '__startDate__',
					type: 'Date',
					value: paramConfig.startDate
				},
				{
					name: '__endDate__',
					type: 'Date',
					value: paramConfig.endDate
				}
			],
			//Manually inserting '@__siteId__' value in sql query
			// as sql IN operator fails to convert comma separated string values to integer type.
			// Also, the parameter for which IN operator is applied is also number.
			// NOTE: Always insert query values through input of prepared statement but
			// manually insert probelmatic/typical values
			dbQuery = `${SITE_METRICS_QUERY.replace(/@__siteId__/g, paramConfig.siteId)}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(`Query for siteid: ${paramConfig.siteId}`);

		return dbHelper.queryDB(databaseConfig)
			.then(transformResultData);
	}
};
