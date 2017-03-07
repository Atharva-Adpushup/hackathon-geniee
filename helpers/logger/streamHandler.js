// Stream handler module for the custom logger middleware

const fs = require('fs'),
    Promise = require('bluebird'),
    _ = require('lodash');

const logToStream = (log, stream) => {
    const appendFile = Promise.promisify(fs.appendFile);

    if(typeof stream === 'object') {
        const filePromises = _.map(stream, streamEntry => {
            return appendFile(streamEntry, JSON.stringify(log, null ,4));
        });

        return Promise.all(filePromises)
            .then(data => {})
            .catch(err => { 
                process.stdout.write('Error occurred while writing logs to file.') 
            });
    } else {
        return appendFile(stream, JSON.stringify(log, null, 4))
            .then(data => {})
            .catch(err => { 
                process.stdout.write('Error occurred while writing logs to file.') 
            });
    }
};

module.exports = logToStream;