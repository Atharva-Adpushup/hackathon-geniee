const express = require('express');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const adpushup = require('../helpers/adpushupEvent');

const router = express.Router();

router.get('/syncCdn', (req, res) => {
	const { sites } = req.query;

	const commaSeperatedNumbersRegex = /^(\d*,?)+[^,]$/;
	const isValidSiteIds = commaSeperatedNumbersRegex.test(sites);
	const isAllSites = sites === 'all';

	if (!isAllSites && !isValidSiteIds) {
		return res.status(httpStatus.BAD_REQUEST).json({ error: 'Sites list is not valid!' });
	}

	const siteIds = isValidSiteIds ? sites.split(',') : [];

	// Fetch Valid SiteIds from db
	return siteModel
		.getSites({ siteIds, keysToReturn: ['siteId'] })
		.then(validSites => {
			const validSiteIds = [];
			validSites.forEach(({ siteId }) => {
				validSiteIds.push(siteId);
				adpushup.emit('siteSaved', siteId);
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
