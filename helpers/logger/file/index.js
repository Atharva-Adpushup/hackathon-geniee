const winston = require('winston'),
    fileLogger = new (winston.Logger)({
        transports: [
			// new (winston.transports.Console)(),
			new (winston.transports.File)({ filename: './logs/debugCode.log' })
		]
    });

module.exports = { fileLogger };
