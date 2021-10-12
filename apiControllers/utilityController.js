const express = require('express');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const adpushup = require('../helpers/adpushupEvent');

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

module.exports = router;
