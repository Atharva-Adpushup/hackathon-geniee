const redis = require('redis');
const config = require('../configs/config');

const REDIS_PORT = config.redisEnvironment.AZURE_CACHE_FOR_REDIS_PORT;
const REDIS_HOST = config.redisEnvironment.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const REDIS_PASSWORD = config.redisEnvironment.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

const redisClient = redis.createClient({
	url: `rediss://${REDIS_HOST}:${REDIS_PORT}`,
	password: REDIS_PASSWORD,
	socket: {
		connectTimeout: 60 * 1000
	}
});

redisClient
	.on('connect', () => {
		console.log('Redis connected');
	})
	.on('error', error => {
		console.log('Redis Connection Error: ', error);
	})
	.on('ready', () => {
		console.log('Redis is ready');
	});

redisClient.connect();

const API = {
	getData: key =>
		new Promise(async (resolve, reject) => {
			if (!redisClient.isOpen || !redisClient.isReady) {
				return reject(new Error('Redis not connected'));
			}

			try {
				const data = await redisClient.get(key);
				return resolve(data);
			} catch (err) {
				console.log(err);
				return reject(err);
			}
		}),
	setValue: (key, value, expiry) =>
		new Promise(async (resolve, reject) => {
			if (!redisClient.isOpen || !redisClient.isReady) {
				return reject(new Error('Redis not connected'));
			}

			try {
				if (expiry) {
					await redisClient.set(key, value, {
						EX: expiry
					});
				} else {
					await redisClient.set(key, value);
				}
				return resolve();
			} catch (err) {
				return reject(err);
			}
		}),
	isConnected: () => redisClient.isOpen && redisClient.isReady,
	flushAll: () =>
		new Promise(async (resolve, reject) => {
			try {
				const suceeded = await redisClient.flushAll();
				return resolve(suceeded);
			} catch (err) {
				return reject(err);
			}
		}),
	getClient: () => redisClient
};

module.exports = API;
