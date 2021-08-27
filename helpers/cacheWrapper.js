const redisClient = require('../middlewares/redis');
const config = require('../configs/config');

const cacheWrapper = async ({ cacheKey, bypassCache = false, cacheExpiry }, callback) => {
	const shouldBypassCache = bypassCache || config.reporting.byPassCache;
	const redisConnected = redisClient.isConnected();
	if (!shouldBypassCache && cacheKey && redisConnected) {
		const data = await redisClient.getData(cacheKey);
		if (data) {
			return {
				cacheHit: true,
				data: JSON.parse(data)
			};
		}
	}

	if (callback) {
		const originalData = await callback.call(null);
		if (originalData) {
			if (!shouldBypassCache && cacheKey && redisConnected) {
				await redisClient.setValue(cacheKey, JSON.stringify(originalData), cacheExpiry);
			}
			return {
				cacheHit: false,
				data: originalData
			};
		}
	}

	return {
		cacheHit: false,
		data: {}
	};
};

module.exports = cacheWrapper;