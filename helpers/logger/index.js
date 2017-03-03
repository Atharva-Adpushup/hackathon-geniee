// Custom logger middleware

const couchbase = require('../couchBaseService'),
    { generateStdOutLog } = require('./logGenerator'),
    { logToStream } = require('./streamHandler'),
    uuid = require('uuid');
    
let loggerOptions = {};

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

const logger = {
    options: options => {
        const { stream, logToStdOut } = options;

        loggerOptions = {
            stream,
            logToStdOut: ('logToStdOut' in options) ? logToStdOut : true
        };
    },

    init: (req, res, next) => {
        const startTime = +new Date(), // Get request start time
            outputStream = process.stdout; // Set standard output stream

        // Listen to request 'end' event and log data
        req.on('end', function () {
            const log = generateStdOutLog(req, res, startTime),
                { stream, logToStdOut } = loggerOptions;

            stream ? logToStream(log, stream) : null; // Write to specified stream in options
            !logToStdOut ? null : outputStream.write(log); // Write request log to stdout stream

            //logToDatabase();
        });

        next();
    }
};

module.exports = logger;

