const { SITE_MODE_WISE_TOP_URLS } = require('../constants'),
	sqlReportModule = require('../../common/mssql/databases/centralWareHouse/dbhelper'),
	extend = require('extend'),
	utils = require('../../../../helpers/utils');

function transformResultData(inputData) {
	return inputData.reduce((resultCollecton, itemObject) => {
		const collectionObject = extend(true, {}, itemObject),
			count = parseInt(collectionObject.count, 10);

		collectionObject.countDesc = utils.numberFormatter(count);
		resultCollecton.push(collectionObject);
		return resultCollecton;
	}, []);
}

module.exports = {
	getData: paramConfig => {
		const inputParameterCollection = [
				{
					name: '__siteId__',
					type: 'Int',
					value: paramConfig.siteId
				},
				{
					name: '__mode__',
					type: 'Int',
					value: paramConfig.mode
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
			//Manually inserting '@__count__' value in sql query
			// as sql engine fails to convert count value.
			// NOTE: Always insert query values through input of prepared statement but
			// manually insert probelmatic/typical values
			dbQuery = `${SITE_MODE_WISE_TOP_URLS.replace('@__count__', paramConfig.count)}`,
			databaseConfig = {
				inputParameters: inputParameterCollection.concat([]),
				query: dbQuery
			};
		console.log(`Query for site mode wise top urls: ${paramConfig.siteId}`);

		return sqlReportModule.queryDB(databaseConfig).then(resultData => {
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
