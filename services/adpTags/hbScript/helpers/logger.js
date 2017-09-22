var beginTime, lastTime;
beginTime = lastTime = +new Date();

function shouldLog() {
	if (window.location.hash && window.location.hash === '#adpdebug') {
		return true;
	}
}

function info() {
	if (shouldLog()) {
		try {
			console.info.apply(this, arguments);
		} catch (error) {}
	}
}

function table(object) {
	if (shouldLog()) {
		try {
			console.table(object);
		} catch (error) {}
	}
}

function log() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = 'adpTags: ' + arrArgs[0];
		try {
			console.info.apply(this, arguments);
		} catch (error) {}
	}
}

function warn() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = 'adphb: ' + arrArgs[0];
		try {
			console.warn.apply(this, arrArgs);
		} catch (error) {}
	}
}

function group(groupName) {
	if (console.group && shouldLog()) {
		console.group(groupName);
	}
}

function groupEnd() {
	if (console.groupEnd && shouldLog()) {
		console.groupEnd();
	}
}

function warn() {
	if (shouldLog()) {
		var arrArgs = [].slice.call(arguments);
		arrArgs[0] = 'adphb: ' + arrArgs[0];
		try {
			console.warn.apply(this, arrArgs);
		} catch (error) {}
	}
}

function initPrebidLog() {
	if (shouldLog()) {
		pbjs.logging = true;
	}
}
module.exports = {
	info: info,
	log: log,
	table: table,
	warn: warn,
	shouldLog: shouldLog,

	group: group,
	groupEnd: groupEnd,

	initPrebidLog: initPrebidLog
};