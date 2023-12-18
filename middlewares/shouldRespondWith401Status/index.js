const closedRoutesFor401ResponseStatus = require('./closedRoutesFor401ResponseStatus');

function shouldRespondWith401Status(req) {
	const { url, method } = req;

	return closedRoutesFor401ResponseStatus.some(
		route => url.startsWith(route.routePrefix) && route.methods.includes(method.toUpperCase())
	);
}

module.exports = shouldRespondWith401Status;
