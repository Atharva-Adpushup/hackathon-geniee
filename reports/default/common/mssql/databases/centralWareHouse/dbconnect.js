const sql = require('mssql');
const config = require('../../../../../../configs/config'),
	dbConfig = config.sql,
	database = config.sqlDatabases['warehouse'];

dbConfig.database = database;
const dbConnection = sql.connect(dbConfig);

module.exports = dbConnection;
