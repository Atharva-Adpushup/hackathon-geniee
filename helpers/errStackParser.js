const request = require('request-promise');
const StackTraceGPS = require('stacktrace-gps');
const StackFrame = require('stackframe');

const getDetailedErrorStack = (stackframes = []) => {
	/* Getting stack of the topmost element as it contains the most important information */
	const stackframe = new StackFrame(stackframes[0]);

	/* We send extra ajax function to fetch source maps from url */
	const gps = new StackTraceGPS({
		ajax: url =>
			request({
				url,
				method: 'get'
			})
				.then(response => response)
				.catch(error => {
					console.log('Error while fetching source map: ', error);
					return {};
				})
	});

	return gps
		.pinpoint(stackframe)
		.then((errInfo = {}) => JSON.stringify(errInfo, null, 3))
		.catch(() =>
			JSON.stringify({ error: 'Error in pinpointing stackframe', ...stackframe }, null, 3)
		);
};

module.exports = {
	getDetailedErrorStack
};
