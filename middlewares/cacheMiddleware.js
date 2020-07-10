const redisClient = require('./redis');
const config = require('../configs/config');

const cache = (req, res, next) => {
	if (!redisClient.connected) {
		next();
	}

	redisClient.get(JSON.stringify(req.query), (err, data) => {
		if (err) {
			console.log(err);
			next();
		}
		if (data !== null && config.reporting.useCachedData) {
			// add cache hit header to identify in client, if this was served from cache
			res.header('X-AP-CACHE', 'HIT');
			res.send(data);
		} else {
			next();
		}
	});
};

module.exports = cache;
