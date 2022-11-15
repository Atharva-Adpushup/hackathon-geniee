const express = require('express');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const adpushup = require('../helpers/adpushupEvent');
const { appBucket } = require('../helpers/routeHelpers');

const router = express.Router();

router.get('/syncCdn', (req, res) => {
	const { sites, forcePrebidBuild } = req.query;

	const siteIds = [];
	const isAllSites = sites === 'all';

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
				adpushup.emit('siteSaved', siteId, forcePrebidBuild);
			});

			return res.status(httpStatus.OK).json({
				success: `Site Ids '${validSiteIds.join(', ')}' published for CDN Sync successfully`
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
	const connectedSitesQuery = `SELECT site.siteId
	FROM (
		SELECT sites
		FROM AppBucket
		WHERE META().id LIKE "user::%%"
			AND adServerSettings.dfp.activeDFPNetwork = "${networkCode}" ) AS ds
	UNNEST sites AS site`;

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
module.exports = router;
