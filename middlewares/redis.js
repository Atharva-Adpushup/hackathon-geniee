const redis = require('redis');
const config = require('../configs/config');

const REDIS_PORT = config.redisEnvironment.REDIS_PORT || 6379;
const REDIS_HOST = config.redisEnvironment.REDIS_HOST || '127.0.0.1';

const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);

redisClient
	.on('connect', () => {
		console.log('redis connected');
		console.log(`connected ${redisClient.connected}`);
	})
	.on('error', error => {
		console.log(error);
	});

const API = {
	getData: key =>
		new Promise((resolve, reject) => {
			if (!redisClient.connected) reject(new Error('Redis not connected'));
			else
				redisClient.get(key, (err, data) => {
					if (err) {
						console.log(err);
						return reject(err);
					}
					return resolve(data);
				});
		}),
	setValue: (key, value, expiry) =>
		new Promise((resolve, reject) => {
			if (!redisClient.connected) reject(new Error('Redis not connected'));
			else if (expiry) {
				redisClient.setex(key, expiry, value);
			} else {
				redisClient.set(key, value);
			}
			resolve();
		}),
	isConnected: () => redisClient.connected,
	flushAll: () =>
		new Promise((resolve, reject) => {
			redisClient.flushall((err, suceeded) => {
				if (err) reject(err);
				else resolve(suceeded);
			});
		}),
	getClient: () => redisClient
};

module.exports = API;
