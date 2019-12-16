const express = require('express');
const _ = require('lodash');

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendSuccessResponse, sendErrorResponse } = require('../helpers/commonFunctions');
const { errorHandler } = require('../helpers/routeHelpers');
const adsTxtModel = require('../models/adsTxtModel');

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
			sitesData = Array.isArray(sitesData) ? sitesData : [sitesData];
			let adsData = [];

			if (currentSelectedEntry === 'Missing Entries') {
				adsData = sitesData.filter(val => val.status === 2 || val.status === 3);
			} else if (currentSelectedEntry === 'Present Entries') {
				adsData = sitesData.filter(val => val.status === 1 || val.status === 3);
			} else if (currentSelectedEntry === 'Global Entries') {
				adsData = sitesData.filter(val => val.status !== 4);
			} else {
				adsData = sitesData.filter(val => val.status === 4);
			}

			return sendSuccessResponse({ adsData, currentSelectedEntry }, res);
		})
		.catch(err => errorHandler(err, res));
});

module.exports = router;
