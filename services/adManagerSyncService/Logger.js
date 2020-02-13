const { customLogger: woodlotCustomLogger, events: woodlotEvents } = require('woodlot');
const {logger: loggerConfig} = require('./config');
const Database = require('./db');
const os = require('os');
const uuid = require('uuid');

let loggerSingleton = null;

class Logger {
    constructor(dbConfig, logExpiryDays, serviceName) {
        this.loggerInstance = null;
        this.dbInstance = null;
        this.dbConfig = dbConfig;
        this.serviceName = serviceName;
        this.logExpirySecs = typeof logExpiryDays === 'undefined' ? 0 : logExpiryDays * 24 * 3600;
        this.init();
    }

    init() {
        this.dbInstance = new Database(this.dbConfig);
        this.loggerInstance = new woodlotCustomLogger({
            streams: ['/dev/null'],
            stdout: true,
            format: {
                type: 'json'
            }
        });
    
        // create alias for err
        this.loggerInstance.error = this.loggerInstance.err;
    
        woodlotEvents.on('info', log => {
            this.send(log.message, 'INFO');
        });
        woodlotEvents.on('debug', log => {
            this.send(log.message, 'INFO');
        });
        woodlotEvents.on('warn', log => {
            this.send(log.message, 'WARNING');
        });
        woodlotEvents.on('err', log => {
            if(log && log.message && log.message.debugData && log.message.debugData.ex && log.message.debugData.ex instanceof Error) {
                log.message.debugData.ex = {
                    error: log.message.debugData.ex.message,
                    stack: log.message.debugData.ex.stack
                };
            }
            this.send(log.message, 'ERROR');
        });
    }

    getLogLevelNumber(level) {
        const map = {
            'INFO': 1,
            'WARNING': 2,
            'ERROR': 3,
            'ERR': 3,
            'UNKNOWN': 4,
            'EXCEPTION': 5
        };
        return map[level] || map['UNKNOWN'];
    };
    
    getHostname() {
        return os.hostname();
    }
    
    getHostRegion() {
        return this.getHostname().split('-')[0] || 'N/A';
    }
    
    async send(logData, logLevel) {
        try {
            await this.dbInstance.insertDoc(`slog::${uuid.v4()}`, {
                date: +new Date(),
                hostname: this.getHostname(),
                region: this.getHostRegion(),
                source: this.serviceName,
                message: logData.message || '',
                type: this.getLogLevelNumber(logLevel) || 3,
                details: logData.details || 'N/A',
                debugData: logData.debugData ? JSON.stringify(logData.debugData) : 'N/A'
            }, this.logExpirySecs);
            return true;
        } catch(ex) {
            console.error('Logger::send::Error', ex);
            return ex;
        }
    }
}

module.exports = function getLogger() {
    try {
        if(loggerSingleton === null) {
            const {db: loggerDbConfig, logExpiryDays, serviceName} = loggerConfig;
            loggerSingleton = new Logger(loggerDbConfig, logExpiryDays, serviceName);
        }
        return loggerSingleton.loggerInstance;
    } catch(ex) {
        console.error('getLogger::Error', ex);
    }
}