const express = require('express');
const httpStatus = require('../configs/httpStatusConsts');
const redisClient = require('../middlewares/redis');
const { HTTP_RESPONSE_MESSAGES } = require('../configs/commonConsts');
const { getSelectiveRolloutFeatureConfigFromCB } = require('../helpers/commonFunctions');
const {
	getFeaturesGroupByFeature: getSelectiveRolloutFeaturesFromCB,
	getSiteConfig: getSelectiveRolloutSiteConfigFromCB
} = require('../helpers/selectiveRollout/cbHelpers/configHelpers');

const router = express.Router();

router.get('/flushRedis', async (req, res) => {
	try {
		const isRedisConnected = redisClient.isConnected();
		if (!isRedisConnected) {
			return res.send('Redis is not connected!');
		}

		await redisClient.flushAll();
		return res.send(HTTP_RESPONSE_MESSAGES.OK);
	} catch (error) {
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
	}
});

router.get('/selectiveRolloutConfig', async (req, res) => {
	const { feature } = req.query;
	try {
		const selectiveRolloutConfigForCurrentFeature = await getSelectiveRolloutFeatureConfigFromCB(
			feature
		);
		return res.status(httpStatus.OK).json(selectiveRolloutConfigForCurrentFeature);
	} catch (error) {
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
	}
});

router.get('/selectiveRolloutSiteConfig', async (req, res) => {
	const { siteId } = req.query;

	if (!siteId || !Number.isInteger(Number(siteId))) {
		return res.status(httpStatus.BAD_REQUEST).send(HTTP_RESPONSE_MESSAGES.INVALID_SITE_ID);
	}

	try {
		const selectiveRolloutConfigForCurrentSite = await getSelectiveRolloutSiteConfigFromCB(siteId);
		return res.status(httpStatus.OK).json(selectiveRolloutConfigForCurrentSite);
	} catch (error) {
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
	}
});

router.get('/selectiveRolloutFeatures', async (req, res) => {
	try {
		const { service, feature } = req.query;

		const selectiveRolloutFeatures = await getSelectiveRolloutFeaturesFromCB(service, feature);
		return res.status(httpStatus.OK).json(selectiveRolloutFeatures);
	} catch (error) {
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.send(HTTP_RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
	}
});

module.exports = router;
