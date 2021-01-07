const redisClient = require('../middlewares/redis');

const cacheWrapper = async ({cacheKey, bypassCache = false, cacheExpiry}, callback) => {
    const redisConnected = redisClient.isConnected();
    if (!bypassCache && cacheKey && redisConnected) {
        const data = await redisClient.getData(cacheKey);
        if (data) {
            return {
                cacheHit: true,
                data: JSON.parse(data)
            }
        }
    }

    if (callback) {
        const originalData = await callback.call(null)
        if (originalData) {
            if (cacheKey && redisConnected) {
                await redisClient.setValue(cacheKey, JSON.stringify(originalData), cacheExpiry);
            }
            return {
                cacheHit: false,
                data: originalData
            }
        }
    }

    return {
        cacheHit: false,
        data: {}
    };
};

module.exports = cacheWrapper;