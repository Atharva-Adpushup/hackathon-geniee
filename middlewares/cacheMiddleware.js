const redis = require('redis');
const config = require('../configs/config');
const REDIS_PORT = config.environment.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const cache = (req, res, next) => {
	client.get(JSON.stringify(req.query), (err, data) => {
		if (err) {
			console.log(err);
			next();
		}
		if (data !== null) {
			res.send(data);
		} else {
			next();
		}
	});
};

module.exports = cache;
