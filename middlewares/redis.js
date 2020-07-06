const redis = require('redis');
const config = require('../configs/config');
const REDIS_PORT = config.redisEnvironment.REDIS_PORT || 6379;
const REDIS_HOST = config.redisEnvironment.REDIS_HOST || '127.0.0.1';

const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);

redisClient
	.on('connect', function() {
		console.log('redis connected');
		console.log(`connected ${redisClient.connected}`);
	})
	.on('error', function(error) {
		console.log(error);
	});

module.exports = redisClient;
