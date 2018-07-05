const sql = require('mssql');
const config = require('../../../../../../configs/config'),
	dbConfig = Object.assign({}, config.sql, {
		database: config.sqlDatabases['warehouse'],
		requestTimeout: 1800000,
		connectionTimeout: 1200000
	});

let pool = null;

function getConnection() {
	pool = new sql.ConnectionPool(dbConfig);
	return pool.connect();
}

module.exports = getConnection;
