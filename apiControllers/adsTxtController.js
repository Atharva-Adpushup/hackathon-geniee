const express = require('express');

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const { errorHandler } = require('../helpers/routeHelpers');
const adsTxtModel = require('../models/adsTxtModel');
const { liveAdsTxtEntryStatus } = require('../configs/commonConsts');

const router = express.Router();

router.post('/adsTxtLiveEntries', (req, res) => {
	if (!req.user.isSuperUser) {
		return sendErrorResponse(
			{
				message: 'Unauthorized Request',
				code: HTTP_STATUSES.UNAUTHORIZED
			},
			res
		);
	}

	const { siteId, currentSelectedEntry, adsTxtSnippet } = req.body;

	const isDataValid = !!currentSelectedEntry;

	if (isDataValid === false) {
		return sendErrorResponse(
			{
				message: 'Missing or Inavalid params.'
			},
			res
		);
	}

	return adsTxtModel
		.getAdsTxtEntries(siteId, adsTxtSnippet, currentSelectedEntry)
		.then(sitesData => {
			// eslint-disable-next-line no-param-reassign
			sitesData = Array.isArray(sitesData) ? sitesData : [sitesData];
			let adsData = [];

			switch (currentSelectedEntry) {
				case 'Missing Entries':
					adsData = sitesData.filter(
						val =>
							val.status === liveAdsTxtEntryStatus.allMissing ||
							val.status === liveAdsTxtEntryStatus.partialPresent
					);
					break;
				case 'Present Entries':
					adsData = sitesData.filter(
						val =>
							val.status === liveAdsTxtEntryStatus.allPresent ||
							val.status === liveAdsTxtEntryStatus.partialPresent
					);
					break;
				case 'Global Entries':
					adsData = sitesData.filter(val => val.status !== liveAdsTxtEntryStatus.noAdsTxt);
					break;
				case 'Mandatory Ads.txt Snippet Missing':
					adsData = sitesData.filter(val => val.status === liveAdsTxtEntryStatus.allMissing);
					break;
				case 'Mandatory Ads.txt Snippet Present':
					adsData = sitesData.filter(val => val.status === liveAdsTxtEntryStatus.allPresent);
					break;

				default:
					adsData = sitesData.filter(val => val.status === liveAdsTxtEntryStatus.noAdsTxt);
					break;
			}

			return sendSuccessResponse({ adsData, currentSelectedEntry }, res);
		})
		.catch(err => errorHandler(err, res));
});

module.exports = router;
