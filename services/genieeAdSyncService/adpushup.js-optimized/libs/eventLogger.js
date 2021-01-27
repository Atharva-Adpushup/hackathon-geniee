const adp = window.adpushup;
const EventLogger = function() {
	this.eventLogs = [];
};

EventLogger.prototype.log = function(logData) {
	const preparedLogData = adp.$.extend(logData, { timestamp: new Date().getTime() });
	this.eventLogs.push(preparedLogData);
};

EventLogger.prototype.getLogsByEventType = function(eventType, removeTypeFromLogs = true) {
	if (!removeTypeFromLogs) {
		return this.eventLogs.filter(event => event.type === eventType);
	}

	return this.eventLogs.reduce((filteredLogs, { type, ...rest }) => {
		if (type === eventType) {
			filteredLogs.push(rest);
		}
		return filteredLogs;
	}, []);
};

EventLogger.prototype.removeLogsByEventType = function(eventType) {
	this.eventLogs = this.eventLogs.filter(event => event.type !== eventType);
};

module.exports = EventLogger;
