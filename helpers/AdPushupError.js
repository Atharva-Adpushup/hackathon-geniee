var utils = require('./utils');

function AdPushupError(message) {
	this.name = 'AdPushupError';
	this.message = message || 'adpushup error message';
	this.stack = new Error().stack;
	utils.logError(this);
}
AdPushupError.prototype = Object.create(Error.prototype);
AdPushupError.prototype.constructor = AdPushupError;
AdPushupError.prototype.toString = function() {
	return utils.htmlEntities(this.message);
};

module.exports = AdPushupError;
