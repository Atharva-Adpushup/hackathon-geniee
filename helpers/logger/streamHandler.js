// Stream handler module for the custom logger middleware

const fs = require('fs'),
	Promise = require('bluebird'),
	_ = require('lodash');

// Add generated log to specified streams
const logToStream = (log, streams) => {
	const appendFile = Promise.promisify(fs.appendFile),
		filePromises = _.map(streams, stream => {
			return appendFile(stream, JSON.stringify(log, null, 4), 'utf8');
		});

	return Promise.all(filePromises)
		.then(data => {})
		.catch(err => {
			process.stdout.write('Error occurred while writing log entry to file stream.');
		});
};

module.exports = logToStream;
