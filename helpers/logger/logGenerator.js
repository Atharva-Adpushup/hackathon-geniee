// Log generator module for the custom logger middleware

const getLogParameters = (req, res, startTime, options) => {
    const responseTime = `${+new Date() - startTime}ms`, // Calculate request processing time
        { method, url, ip, body, params, query, httpVersion, headers } = req,
        { statusCode } = res,
        timeStamp = new Date(),
        contentType = res.get('Content-Type'),
        contentLength = res.get('Content-Length'),
        userAgent = req.get('user-agent'),
        referrer = req.get('referer');

    return { responseTime, method, url, ip, body, params, query, httpVersion, headers: options.headers ? headers: undefined, statusCode, timeStamp, contentType, contentLength, userAgent, referrer: referrer ? referrer : null };
};

const generateLog = (req, res, startTime, options, type) => {
    const params = getLogParameters(req, res, startTime, options),
        { ip, timeStamp, method, url, httpVersion, statusCode, userAgent } = params;

    // Generate log entry based on type
    switch(type) {
        case 'stdout':
            return `${ip} - ${timeStamp} ${method} ${url} HTTP${httpVersion} ${statusCode} - ${userAgent}\n`;
            break;
        case 'json':
            return params;
            break;
    }
};

module.exports = generateLog;