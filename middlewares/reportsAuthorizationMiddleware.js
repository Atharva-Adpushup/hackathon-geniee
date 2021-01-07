const _ = require('lodash');
const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { getAllUserSites } = require('../models/userModel');
const { sendErrorResponse } = require('../helpers/commonFunctions');

const reportsAccess = async (req, res, next) => {
	let isAuthorized = false;
	const {
		user: { email, isSuperUser = false, isAdpUser = false } = {},
		query,
		query: { params }
	} = req;
	if (isSuperUser || isAdpUser) isAuthorized = true;
	else {
		const allSites = await getAllUserSites(email).map(site => site.siteId.toString());
		let sitesBeingFetched =
			(query && (query.siteid || query.sites)) ||
			(params && _.isString(params) && JSON.parse(params).siteid) ||
			null;
		sitesBeingFetched = (sitesBeingFetched && sitesBeingFetched.split(',')) || [];
		if (_.difference(sitesBeingFetched, allSites).length === 0) {
			isAuthorized = true;
		}
	}

	if (!isAuthorized) {
		return sendErrorResponse(
			{
				message: 'Unauthorized Request'
			},
			res,
			HTTP_STATUSES.UNAUTHORIZED
		);
	}

	return next();
};

module.exports = reportsAccess;
