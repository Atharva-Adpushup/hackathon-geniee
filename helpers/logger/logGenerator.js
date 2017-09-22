// Log generator module for custom logger middleware

// Get required parameters from request and response object to generate log entry
const getLogParameters = (req, res, startTime, options) => {
	const responseTime = `${+new Date() - startTime}ms`, // Calculate request processing time
		{ method, originalUrl, ip, body, params, query, httpVersion, headers } = req,
		{ statusCode } = res,
		timeStamp = new Date(),
		contentType = res.get('Content-Type'),
		contentLength = res.get('Content-Length'),
		userAgent = req.get('user-agent'),
		referrer = req.get('referer');

	return {
		responseTime,
		method,
		url: originalUrl,
		ip,
		body,
		params,
		query,
		httpVersion,
		headers: options.logHeaders ? headers : undefined,
		statusCode,
		timeStamp,
		contentType,
		contentLength,
		userAgent,
		referrer: referrer ? referrer : null
	};
};

// Function to generate log entry for stdout and specified streams
const generateLog = (req, res, startTime, options, type) => {
	const params = getLogParameters(req, res, startTime, options),
		{ ip, timeStamp, method, url, httpVersion, statusCode, contentLength, referrer, userAgent } = params;

	// Generate log entry based on type
	switch (type) {
		case 'stdout':
			const resContentLength = contentLength ? contentLength : '-',
				resReferrer = referrer ? `"${referrer}"` : '-';

			return `${ip} [${timeStamp}] "${method} ${url} HTTP${httpVersion}" ${statusCode} ${resContentLength} ${resReferrer} "${userAgent}"\n`;
			break;

		case 'json':
			return params;
			break;
	}
};

module.exports = generateLog;
