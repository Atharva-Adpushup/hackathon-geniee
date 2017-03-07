// Stream handler module for the custom logger middleware

const fs = require('fs'),
    Promise = require('bluebird'),
    _ = require('lodash');

const logToStream = (log, streams) => {
    const appendFile = Promise.promisify(fs.appendFile);

    const filePromises = _.map(streams, stream => {
        return appendFile(stream, JSON.stringify(log, null, 4));
    });

    return Promise.all(filePromises)
        .then(data => { })
        .catch(err => {
            process.stdout.write('Error occurred while writing logs to file.')
        });
};

module.exports = logToStream;