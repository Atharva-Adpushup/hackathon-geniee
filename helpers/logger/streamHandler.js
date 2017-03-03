// Stream handler module for the custom logger middleware

const fs = require('fs'),
    Promise = require('bluebird');

const logToStream = (log, stream) => {
    const appendFile = Promise.promisify(fs.appendFile);

    return appendFile(stream, JSON.stringify(log, null, 4))
        .then(d => {
            console.log('Log saved to file');
        })
        .catch(err => {
            console.log(err);
        })
};

module.exports = { logToStream };