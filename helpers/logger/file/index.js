const woodlot = require('woodlot').customLogger,
	fileLogger = new woodlot({
		streams: ['./logs/debugCode-new.log'],
		stdout: false
	});

module.exports = { fileLogger };
