const $ = require('./jquery');

const EventLogger = function() {
	this.eventLogs = [];
};

EventLogger.prototype.log = function(logData) {
	const preparedLogData = $.extend(logData, { timestamp: new Date().getTime() });
	this.eventLogs.push(preparedLogData);
};

EventLogger.prototype.getLogsByEventType = function(eventType) {
	return this.eventLogs.filter(event => event.type === eventType);
};

EventLogger.prototype.removeLogsByEventType = function(eventType) {
	this.eventLogs = this.eventLogs.filter(event => event.type !== eventType);
};

module.exports = EventLogger;
