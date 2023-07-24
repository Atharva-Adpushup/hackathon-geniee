const express = require('express');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const adpushup = require('../helpers/adpushupEvent');
const { appBucket } = require('../helpers/routeHelpers');
const redisClient = require('../middlewares/redis');
const { HTTP_RESPONSE_MESSAGES } = require('../configs/commonConsts');
const { getSelectiveRolloutFeatureConfigFromCB } = require('../helpers/commonFunctions');

const router = express.Router();

router.get('/syncCdn', (req, res) => {
	const { sites, forcePrebidBuild = false, type = false } = req.query;

	const siteIds = [];
	const isAllSites = sites === 'all';
	console.log('site Sync Requested for:', sites);
	const ipAddress = req.header('x-forwarded-for') || req.ips || req.socket.remoteAddress;
	console.log('ipAddress:', ipAddress);
	if (!isAllSites) {
		const sitesArr = sites && sites.split(',');

		let isValidSiteIds = true;
		if (Array.isArray(sitesArr) && sitesArr.length) {
			// eslint-disable-next-line no-restricted-syntax
			for (const siteId of sitesArr) {
				const cleanedSiteId = parseInt(siteId.trim(), 10);
				if (!cleanedSiteId || !Number.isInteger(cleanedSiteId)) {
					isValidSiteIds = false;
					break;
				}

				siteIds.push(cleanedSiteId);
			}
		} else {
			isValidSiteIds = false;
		}

		if (!isValidSiteIds || !siteIds.length) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Sites list is not valid!' });
		}
	}

	// Fetch Valid SiteIds from db
	return siteModel
		.getSites({ siteIds, keysToReturn: ['siteId'] })
		.then(validSites => {
			const validSiteIds = [];
			validSites.forEach(({ siteId }) => {
				validSiteIds.push(siteId);
				const options = { type };
				adpushup.emit('siteSaved', siteId, { forcePrebidBuild, options });
			});

			return res.status(httpStatus.OK).json({
				success: `Site Ids '${validSiteIds.join(', ')}' published for Sync successfully`
			});
		})
		.catch(err => {
			// eslint-disable-next-line no-console
			console.log(err);

			return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Someting went wrong!' });
		});
});

router.get('/syncGAMSites', async (req, res) => {
	const { networkCode = false } = req.query;
	// eslint-disable-next-line no-restricted-globals
	if (!networkCode || isNaN(networkCode)) {
		return res.status(httpStatus.BAD_REQUEST).json({ error: 'Please provide a network code!' });
	}
	const connectedSitesQuery = `
	SELECT siteId
	FROM AppBucket
	WHERE META().id LIKE "site::%"
    AND dataFeedActive = TRUE
    AND siteId IN (
    	SELECT RAW site.siteId
    	FROM (
        	SELECT sites
        	FROM AppBucket a
        	WHERE META().id LIKE "user::%%"
            	AND adServerSettings.dfp.activeDFPNetwork = "${networkCode}" ) AS ds
    	UNNEST sites AS site)
	`;

	try {
		let connectedSites = await appBucket.queryDB(connectedSitesQuery);
		if (Array.isArray(connectedSites) && connectedSites.length) {
			connectedSites = connectedSites.map(site => site.siteId);
			return res.redirect(`/api/utils/syncCdn?sites=${connectedSites.join(',')}`);
		}
		return res.status(httpStatus.BAD_REQUEST).json({ error: 'No sites attached to this GAM' });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ error: `Someting went wrong! ${error}` });
	}
});

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

module.exports = router;
