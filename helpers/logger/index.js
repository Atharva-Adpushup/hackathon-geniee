// Custom logger middleware

const generateLog = require('./logGenerator'),
    logToStream = require('./streamHandler'),
    events = require('events'),
    loggerEvents = new events.EventEmitter,
    _ = require('lodash');

const loggerInit = (req, res, next, options) => {
    const startTime = +new Date(), // Get request start time
        outputStream = process.stdout; // Set standard output stream

    // Listen to response 'finish' event and log data
    res.on('finish', function () {
        const stdOutLog = generateLog(req, res, startTime, options, 'stdout'),
            streamJSONLog = generateLog(req, res, startTime, options, 'json');

        options.stream ? logToStream(streamJSONLog, options.stream) : null; // Write to specified stream in options
        options.logToConsole ? outputStream.write(stdOutLog) : null; // Write request log to stdout stream

        loggerEvents.emit('log', streamJSONLog);
    });

    next();
};

const logger = options => {
    const { stream, logToStdOut, logFor } = options,
        logToConsole = ('logToStdOut' in options) ? logToStdOut : true;
    
    options.logToConsole = logToConsole;

    return (req, res, next) => {

        if(typeof logFor === 'object' && logFor.length) {
            const validLogRoute = _.find(logFor, logRoute => req.url.indexOf(logRoute) !== -1);
            if(validLogRoute) {
                return loggerInit(req, res, next, options);
            } else {
                next();
            }
        } else {
            return loggerInit(req, res, next, options);
        }
    }
};

module.exports = { logger, loggerEvents } ;

