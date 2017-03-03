// Custom logger middleware

const couchbase = require('./couchBaseService');

const generateLog = (req, res, startTime) => {
		const processingTime = `${+new Date() - startTime}ms`, // Calculate request processing time
			{ method, url, ip, body, params, query, httpVersion, baseUrl } = req,
			{ statusCode } = res,
            timeStamp = new Date();

		// Generate JSON log entry
		const log = {
			statusCode,
			method,
			url,
			ip,
			body,
			params,
			query,
			httpVersion,
			timeStamp,
			userAgent: req.get('user-agent'),
			processingTime,
			baseUrl
		},
        logString = `${ip} - ${timeStamp} "${method} ${url} HTTP${httpVersion} ${statusCode}`;
        
		return logString;
	},
    logToDatabase = () => {
        couchbase.connectToBucket('apGlobalBucket')
            .then(data => {
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            });
    },
	logger = (req, res, next) => {
		const startTime = +new Date(), // Get request start time
			stream = process.stdout; // Set standard output stream

		// Listen to request 'end' event and log data
		req.on('end', function () {
			var log = generateLog(req, res, startTime);

            logToDatabase();

			// Write request log to output stream
			//stream.write(log);
		});
        

		next();
	};

module.exports = logger;

