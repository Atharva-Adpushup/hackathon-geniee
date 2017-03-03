// Log generator module for the custom logger middleware

const generateStdOutLog = (req, res, startTime) => {
    const responseTime = `${+new Date() - startTime}ms`, // Calculate request processing time
        { method, url, ip, body, params, query, httpVersion, headers } = req,
        { statusCode } = res,
        timeStamp = new Date(),
        contentType = res.get('Content-Type'),
        contentLength = res.get('Content-Length'),
        userAgent = req.get('user-agent'),
        referrer = req.get('referer');

    // Generate string log entry to log to stdout
    const logString = `${ip} - ${timeStamp} "${method} ${url} HTTP${httpVersion} ${statusCode}\n`;

    return logString;
};

const generateStreamLog = () => {

};

module.exports = { generateStdOutLog, generateStreamLog };