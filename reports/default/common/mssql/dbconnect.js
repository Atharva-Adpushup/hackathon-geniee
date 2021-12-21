const sql = require('mssql'),
	config = require('../../../../configs/config'),
	dbConnection = sql.connect(config.sql).catch(err => {
		if(config.environment.HOST_ENV === 'production') {
			throw err;
		}
	  });	

module.exports = dbConnection;
