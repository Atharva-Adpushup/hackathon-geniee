// Custom error handler

function AdpError(message) {
	this.name = 'AdpError';
	this.message = message || 'AdPushup error';
}

module.exports = AdpError;
