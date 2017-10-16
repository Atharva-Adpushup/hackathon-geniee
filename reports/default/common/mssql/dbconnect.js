const sql = require('mssql'),
	config = require('../../../../configs/config'),
	dbConnection = sql.connect(config.sql);

module.exports = dbConnection;
