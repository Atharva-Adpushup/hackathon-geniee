const HTTP_STATUS = require('../configs/httpStatusConsts');
const { sendErrorResponse } = require('../helpers/commonFunctions');
const userModel = require('../models/userModel');

const validateAdUnitsToBeAnArray = (req, res, next) => {
	const { adUnits } = req.body;

	if (!Array.isArray(adUnits)) {
		return sendErrorResponse(
			{ message: 'adUnits must be an array!' },
			res,
			HTTP_STATUS.BAD_REQUEST
		);
	}

	return next();
};

const validateApLiteUnitCreationPayload = (req, res, next) => {
	const { adUnits } = req.body;

	// validate ad units
	for (let adUnitIdx = 0; adUnitIdx < adUnits.length; adUnitIdx += 1) {
		const adUnit = adUnits[adUnitIdx];
		if (!adUnit.dfpAdUnit || !adUnit.dfpAdunitCode) {
			return sendErrorResponse(
				{ message: 'either dfpAdUnit or dfpAdunitCode is missing!', adUnit },
				res,
				HTTP_STATUS.BAD_REQUEST
			);
		}
	}

	return next();
};

const pathParamSiteAccessValidation = (req, res, next) => {
	const { siteId } = req.params;

	if (!siteId || Number.isNaN(Number(siteId))) {
		return sendErrorResponse(
			{
				message: 'Site Id is invalid!'
			},
			res,
			HTTP_STATUS.BAD_REQUEST
		);
	}

	return userModel
		.getAllUserSites(req.user.email)
		.then(sites => {
			if (!sites.map(site => site.siteId).includes(Number(siteId))) {
				return sendErrorResponse(
					{
						message: 'You do not have access to this site!'
					},
					res,
					HTTP_STATUS.BAD_REQUEST
				);
			}
			return next();
		})
		.catch(() =>
			sendErrorResponse(
				{
					message: 'Internal Server Error!'
				},
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR
			)
		);
};

module.exports = {
	validateAdUnitsToBeAnArray,
	validateApLiteUnitCreationPayload,
	pathParamSiteAccessValidation
};
