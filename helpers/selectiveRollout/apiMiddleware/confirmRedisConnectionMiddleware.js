const commonConsts = require('../../../configs/commonConsts');
const httpStatusConsts = require('../../../configs/httpStatusConsts');
const redisClient = require('../../../middlewares/redis');

module.exports = function confirmRedisConnectionMiddleware(_, res, next) {
	const isRedisConnected = redisClient.isConnected();
	if (isRedisConnected) {
		return next();
	}

	return res
		.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
		.send({ message: commonConsts.REDIS.NOT_CONNECTED_MESSAGE });
};
