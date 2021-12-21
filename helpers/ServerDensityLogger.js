const StatsdClient = require('statsd-client');
const config = require('../configs/config');
const client = new StatsdClient({ host: config.serverDensity.host });

module.exports = {
	increment: label => {
        client.increment(label);
    }
};