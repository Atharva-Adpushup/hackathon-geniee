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
			res.send(data);
		} else {
			next();
		}
	});
};

module.exports = cache;
