// Custom logger middleware

const couchbase = require('../couchBaseService'),
    { generateStdOutLog, generateStreamJSONLog } = require('./logGenerator'),
    { logToStream } = require('./streamHandler'),
    uuid = require('uuid');

const logToDatabase = () => {
    couchbase.connectToBucket('apGlobalBucket')
        .then(appBucket => appBucket.insertPromise(`slog::${uuid.v4()}`, {
            date: new Date(),
            source: 'Geniee Logs',
            message: 'Dummy'
        }))
        .then(success => {
            console.log('Log added');
        })
        .catch(err => {
            console.log(err);
        });
};

const logger = options => {
    const { stream, logToStdOut } = options,
        logToConsole =  ('logToStdOut' in options) ? logToStdOut : true;

    return (req, res, next) => {
        const startTime = +new Date(), // Get request start time
            outputStream = process.stdout; // Set standard output stream

        // Listen to request 'end' event and log data
        req.on('end', function () {
            const stdOutLog = generateStdOutLog(req, res, startTime, options),
                streamLog = generateStreamJSONLog(req, res, startTime, options);

            stream ? logToStream(streamLog, stream) : null; // Write to specified stream in options
            logToConsole ? outputStream.write(stdOutLog) : null; // Write request log to stdout stream

            //logToDatabase();
        });

        next();
    }
};

module.exports = logger;

