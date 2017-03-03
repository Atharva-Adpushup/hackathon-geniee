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

const generateStdOutLog = (req, res, startTime, options) => {
    const params = getLogParameters(req, res, startTime, options),
        { ip, timeStamp, method, url, httpVersion, statusCode } = params;

    // Generate string log entry to log to stdout
    const logString = `${ip} - ${timeStamp} "${method} ${url} HTTP${httpVersion} ${statusCode}\n`;

    return logString;
};

const generateStreamJSONLog = (req, res, startTime, options) => params = getLogParameters(req, res, startTime, options);

module.exports = { generateStdOutLog, generateStreamJSONLog };