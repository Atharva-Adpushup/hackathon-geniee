var winston = require('winston'),
	// Set up logger
	customColors = {
		trace: 'white',
		debug: 'green',
		info: 'green',
		warn: 'yellow',
		crit: 'red',
		fatal: 'red'
	},
	logger = new (winston.Logger)({
		colors: customColors,
		transports: [
			new (winston.transports.File)({
				filename: __dirname + '/../logs/adpushupError.log',
				colorize: true,
				timestamp: true
			})
		]
	}),
	origLog;

winston.addColors(customColors);
// Extend logger object to properly log 'Error' types
origLog = logger.log;

logger.log = function(level, err) {
	var objType = Object.prototype.toString.call(err);
	if (objType === '[object Error]') {
		origLog.call(logger, level, err.toString() + ', Stack: ' + err.stack);
	} else {
		origLog.call(logger, level, err);
	}
};


module.exports = logger;
