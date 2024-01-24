const redisClient = require('../../middlewares/redis');
const httpStatusConsts = require('../../configs/httpStatusConsts');
const commonConsts = require('../../configs/commonConsts');
const { HTTP_RESPONSE_MESSAGES } = require('../../configs/commonConsts');

module.exports = {
	deleteKey: async (req, res) => {
		try {
			const { key } = req.body;
			await redisClient.delete([key]);
			return res.json({ msg: `Key ${key} is deleted from cache!` });
		} catch (error) {
			console.log(error);
			return res
				.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
				.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
		}
	},

	deleteKeys: async (req, res) => {
		try {
			const { keyPattern } = req.body;
			const keys = await redisClient.keys(keyPattern);

			if (keys.length === 0) {
				return res.json({ msg: commonConsts.REDIS.KEYS_NOT_FOUND });
			}

			const numKeysDeleted = await redisClient.delete(keys);
			return res.json({ msg: `${numKeysDeleted} keys deleted!` });
		} catch (error) {
			console.log(error);
			return res
				.status(httpStatusConsts.INTERNAL_SERVER_ERROR)
				.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
		}
	}
};
