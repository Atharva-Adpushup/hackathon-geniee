const Promise = require('bluebird');
const express = require('express');

const { sendErrorResponse, sendSuccessResponse } = require('../helpers/commonFunctions');
const {
	verifyOwner,
	fetchStatusesFromReporting,
	fetchCustomStatuses
} = require('../helpers/routeHelpers');
const httpStatus = require('../configs/httpStatusConsts');

const router = express.Router();

router.get('/fetchAppStatuses', (req, res) => {
	const { siteId } = req.query;
	const { email } = req.user;

	if (!siteId) {
		return sendErrorResponse(
			{
				message: 'Incomplete params. Site Id is necessary'
			},
			res,
			httpStatus.BAD_REQUEST
		);
	}
	/*
		Flow:
		1. Fetch and Verify Site
		2. Fetch App Statuses
			- Call to Reporting API
				- Layout, AdRecover, Innovative Ads, AP Tag, Header Bidding
			- Fetch Channels
				- Mediation: Auto Optimise in Channels
				- AMP: IsEnabled in Channels
			- Manage Ads.txt: Check Redirect
		3. Prepare final JSON for client
	*/

	return verifyOwner(siteId, email)
		.then(site =>
			Promise.join(
				fetchStatusesFromReporting(site),
				fetchCustomStatuses(site),
				(statusesFromReporting, customStatuses) =>
					sendSuccessResponse(
						{
							...site.data,
							appStatuses: {
								...statusesFromReporting,
								...customStatuses
							}
						},
						res
					)
			)
		)
		.catch(err => {
			console.log(err);
			sendErrorResponse(err, res);
		});
});

module.exports = router;
