// Custom logger middleware

const generateLog = require('./logGenerator'),
    logToStream = require('./streamHandler'),
    events = require('events'),
    loggerEvents = new events.EventEmitter,
    _ = require('lodash');

// Initialise logger with options
const loggerInit = (req, res, next, options) => {
    const startTime = +new Date(), // Get request start time
        outputStream = process.stdout; // Set standard output stream

    // Listen to response 'finish' event and log data
    res.on('finish', function () {
        const stdOutLog = generateLog(req, res, startTime, options, 'stdout'),
            streamJSONLog = generateLog(req, res, startTime, options, 'json');

        options.stream ? logToStream(streamJSONLog, options.stream) : null; // Write to specified stream
        options.logToConsole ? outputStream.write(stdOutLog) : null; // Write request log to stdout

        loggerEvents.emit('log', streamJSONLog); // Emit log event with JSON log output
        loggerEvents.emit(res.statusCode, streamJSONLog); // Emit 'statusCode' event with JSON log output 

        if(res.statusCode >= 400) {
            loggerEvents.emit('error', streamJSONLog); // Emit 'error' event with JSON log output
        }
    });

    next();
};

// Logger middleware entry
const logger = options => {
    const { stream, logToStdOut, logFor } = options,
        logToConsole = ('logToStdOut' in options) ? logToStdOut : true;
    
    options.logToConsole = logToConsole;

    return (req, res, next) => {

        // Create log entry for all valid log routes present in 'logFor' options
        if(typeof logFor === 'object' && logFor.length) {
            const validLogRoute = _.find(logFor, logRoute => req.url.indexOf(logRoute) !== -1);
            if(validLogRoute) {
                return loggerInit(req, res, next, options);
            } else {
                next();
            }
        }
        // Else create log entry for all routes
        else {
            return loggerInit(req, res, next, options);
        }
    }
};

module.exports = { logger, loggerEvents } ;

