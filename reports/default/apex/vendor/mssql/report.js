const { GET_METRICS_QUERY } = require('./constants/constants'),
	dbHelper = require('./dbhelper');

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
			sitePageGroupObjectPlaceHolder, revenuePlaceHolder;

		if (!isRootLevelObject) {
			accumulator[reportObject.siteId] = {pageGroups: {}};
		}
		sitePageGroupObjectPlaceHolder = Object.assign({}, accumulator[reportObject.siteId].pageGroups);

		isChannelExists = !!(isRootLevelObject && sitePageGroupObjectPlaceHolder && sitePageGroupObjectPlaceHolder.hasOwnProperty(channelName));
		if (!isChannelExists) {
			sitePageGroupObjectPlaceHolder[channelName] = {variations: {}};
		}

		isVariationIdExists = !!(isChannelExists && sitePageGroupObjectPlaceHolder[channelName].variations && sitePageGroupObjectPlaceHolder[channelName].variations.hasOwnProperty(variationKey));
		if (!isVariationIdExists) {
			sitePageGroupObjectPlaceHolder[channelName].variations[variationKey] = {dayWisePageViews: {}, days: {}, click: 0, impression: 0, revenue: 0.0, pageViews: 0};
		}

		isMatchedDateExists = !!(isVariationIdExists && sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].days &&  sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].days.hasOwnProperty(matchedDateValue));
		if (!isMatchedDateExists) {
			sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].days[matchedDateValue] = {
				pageViews: reportObject.pageViews,
				impression: reportObject.impressions,
				click: reportObject.clicks,
				revenue: Number(reportObject.revenue.toFixed(2))
			};
		}

		isDayWisePageViewsExists = !!(isVariationIdExists && sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].dayWisePageViews &&  sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].dayWisePageViews.hasOwnProperty(matchedDateValue));
		if (!isDayWisePageViewsExists) {
			sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].dayWisePageViews[matchedDateValue] = reportObject.pageViews;
		}

		sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].click += reportObject.clicks;
		sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].impression += reportObject.impressions;
		sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].pageViews += reportObject.pageViews;

		sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].revenue += reportObject.revenue;
		revenuePlaceHolder = Number(sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].revenue.toFixed(2));
		sitePageGroupObjectPlaceHolder[channelName].variations[variationKey].revenue = revenuePlaceHolder;

		accumulator[reportObject.siteId].pageGroups = Object.assign({}, sitePageGroupObjectPlaceHolder);

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
			dbQuery = `${GET_METRICS_QUERY.replace(/@__siteId__/g, paramConfig.siteId)}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(`Query for siteid: ${paramConfig.siteId}`);

		return dbHelper.queryDB(databaseConfig)
			.then(transformResultData);
	}
};
