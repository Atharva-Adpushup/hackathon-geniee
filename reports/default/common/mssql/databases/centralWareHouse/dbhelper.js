const sql = require('mssql'),
	dbConnection = require('./dbconnect'),
	Promise = require('bluebird');

function addInputParameters(parameterCollection, sqlInstance) {
	const isValidConfig = !!(parameterCollection && parameterCollection.length);

	if (!isValidConfig) {
		return sqlInstance;
	}

	return Promise.all(
		parameterCollection.map(paramObject => {
			return sqlInstance.input(paramObject.name, sql[paramObject.type], paramObject.value);
		})
	).then(() => {
		return sqlInstance;
	});
}

function validateResultData(result) {
	const isResultData = !!(result && Object.keys(result).length),
		isValidResultData = !!(isResultData && result.recordset && result.recordset.length);

	if (!isValidResultData) {
		return [];
	}
	return result.recordset;
}

module.exports = {
	queryDB: dbConfig => {
		return dbConnection()
			.then(pool => pool.request())
			.then(addInputParameters.bind(null, dbConfig.inputParameters))
			.then(pool => {
				return pool.query(dbConfig.query).then(validateResultData);
			});
	}
};
