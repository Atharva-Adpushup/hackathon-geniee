const redis = require('redis');

const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const cache = (req, res, next) => {
	client.get(JSON.stringify(req.query), (err, data) => {
		if (err) throw err;
		if (data !== null) {
			res.send(data);
		} else {
			next();
		}
	});
};

module.exports = cache;
