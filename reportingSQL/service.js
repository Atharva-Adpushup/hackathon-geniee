var sql = require('mssql'),
	_ = require('lodash'),
	Promise = require('bluebird'),
	dbConfig = require('./config').sqlReporting,
	config = {
		server: dbConfig.server,
		user: dbConfig.user,
		password: dbConfig.password,
		database: dbConfig.database,
		connectionTimeout: dbConfig.connectionTimeout,
		requestTimeout: dbConfig.requestTimeout,
		options: {
			encrypt: true
		}
	},
	connectionPool = false;

function getConnection() {
	if (connectionPool) {
		return Promise.resolve(connectionPool.request());
	}

	return sql.connect(config).then(pool => {
		connectionPool = pool;
		return pool.request();
	});
}

function executeQuery(connection, query) {
	return connection.query(query);
}

function resultProcessing(result) {
	var recordsets = result.recordsets ? result.recordsets : [],
		columnsObject = result.recordset.columns,
		columns = Object.keys(columnsObject),
		noOfRows = result.rowsAffected[0];

	output = {
		recordsets: recordsets,
		columns: columns,
		noOfRows: noOfRows
	};
	return output;
}

function init(query) {
	return getConnection()
		.then(connection => {
			console.log(query);
			return executeQuery(connection, query);
		})
		.then(resultProcessing)
		.catch(error => {
			console.log(error.message);
			throw error;
		});
}

module.exports = init;
