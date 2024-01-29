const express = require('express');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const { appBucket, sendDataToElasticService } = require('../helpers/routeHelpers');
const adpushup = require('../helpers/adpushupEvent');
const { SERVICES_FOR_KIBANA_LOGS } = require('../configs/commonConsts');

const DEFAULT_SYNC_TRIGGERED_BY_VALUE = 'N/A';
const router = express.Router();

const logSiteSyncingEvent = logData => {
	const siteSyncServiceName = SERVICES_FOR_KIBANA_LOGS.SITE_SYNC_SERVICE;
	sendDataToElasticService(logData, siteSyncServiceName);
};

const isNetworkWideSyncTriggered = sites => sites === 'all';

const parseSiteId = siteId => {
	const parsedSiteId = parseInt(siteId.trim(), 10);
	return !Number.isNaN(parsedSiteId);
};

const getConnectedSitesCouchbaseQuery = networkCode =>
	`
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

const getResponseData = (status, messageType, message) => ({
	status,
	json: {
		[messageType]: message
	}
});
const getSiteSyncSuccessMessage = sitesSyncedArr => {
	const numberOfSites = sitesSyncedArr.length;
	return `${numberOfSites} Site${numberOfSites > 1 ? 's' : ''} with Id${
		numberOfSites > 1 ? 's' : ''
	} '${sitesSyncedArr.join(',')}' published for Sync successfully`;
};
/*
 Fetch Valid SiteIds from db
 If empty siteIds arr is empty it signifies a networkwide sync
*/
const syncSites = async (siteIds, data) => {
	try {
		const { type = false, forcePrebidBuild = false, email, service } = data;
		const siteIdsToSync = await siteModel.getSites({
			siteIds,
			keysToReturn: ['siteId']
		});

		if (!siteIdsToSync || !siteIdsToSync.length) {
			return getResponseData(
				httpStatus.FORBIDDEN,
				'error',
				"Site Ids passed don't correspond to any existing sites"
			);
		}
		const sitesSyncedArr = siteIdsToSync.map(({ siteId }) => {
			const options = { type };
			adpushup.emit('siteSaved', siteId, { forcePrebidBuild, options });
			return siteId;
		});

		logSiteSyncingEvent({
			sitesSynced: sitesSyncedArr,
			email,
			triggeredByService: service
		});

		return getResponseData(httpStatus.OK, 'success', getSiteSyncSuccessMessage(sitesSyncedArr));
	} catch (err) {
		return getResponseData(
			httpStatus.INTERNAL_SERVER_ERROR,
			'error',
			`Someting went wrong! The err is: ${err.toString()}`
		);
	}
};

router.get('/syncCdn', async (req, res) => {
	const {
		sites = null,
		service = DEFAULT_SYNC_TRIGGERED_BY_VALUE,
		forcePrebidBuild = false,
		type = false
	} = req.query;

	if (!sites) {
		return res.status(httpStatus.BAD_REQUEST).json({ error: 'No sites passed to sync!' });
	}

	let siteIdsToSync = [];
	const userEmail = req.user.email;
	// If network wide sync is not triggered then all the siteIds passed are validated
	if (!isNetworkWideSyncTriggered(sites)) {
		const siteListArr = sites.split(',');
		if (!Array.isArray(siteListArr) && !siteListArr.length) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'No sites passed for syncing!' });
		}

		siteIdsToSync = siteListArr.filter(parseSiteId);

		if (!siteIdsToSync.length) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: `Site list is not valid!` });
		}
	}

	const { status, json } = await syncSites(siteIdsToSync, {
		service,
		forcePrebidBuild,
		type,
		email: userEmail
	});
	return res.status(status).json(json);
});

router.get('/syncGAMSites', async (req, res) => {
	try {
		const { networkCode = false, service = DEFAULT_SYNC_TRIGGERED_BY_VALUE } = req.query;
		// eslint-disable-next-line no-restricted-globals
		if (!networkCode || isNaN(networkCode)) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Please provide a network code!' });
		}

		const connectedSitesQuery = getConnectedSitesCouchbaseQuery(networkCode);
		let connectedSites = await appBucket.queryDB(connectedSitesQuery);
		if (!Array.isArray(connectedSites) && !connectedSites.length) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'No sites attached to this GAM' });
		}

		connectedSites = connectedSites.map(site => site.siteId);
		const userEmail = req.user.email;
		const { status, json } = await syncSites(connectedSites, {
			service,
			email: userEmail
		});
		return res.status(status).json(json);
	} catch (error) {
		return res
			.status(httpStatus.INTERNAL_SERVER_ERROR)
			.json({ error: `Someting went wrong! ${error}` });
	}
});

module.exports = router;
