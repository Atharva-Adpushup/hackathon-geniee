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
		.then(sitesData => sendSuccessResponse(sitesData, res))
		.catch(err => errorHandler(err, res));
});

module.exports = router;
