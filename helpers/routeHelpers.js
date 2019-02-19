const Promise = require('bluebird');
const _ = require('lodash');
const { couchbaseService } = require('node-utils');

const config = require('../configs/config');
const { sendErrorResponse, sendSuccessResponse } = require('./commonFunctions');
const siteModel = require('../models/siteModel');
const HTTP_STATUS = require('../configs/httpStatusConsts');

const appBucket = couchbaseService(
	`couchbase://${config.couchBase.HOST}/${config.couchBase.DEFAULT_BUCKET}`,
	config.couchBase.DEFAULT_BUCKET,
	config.couchBase.DEFAULT_USER_NAME,
	config.couchBase.DEFAULT_USER_PASSWORD
);

function verifyOwner(siteId, userEmail) {
	return siteModel.getSiteById(siteId).then(site => {
		if (site.get('ownerEmail') !== userEmail) {
			return Promise.reject(
				new Error({ message: 'Unauthorized Request', code: HTTP_STATUS.PERMISSION_DENIED })
			);
		}
		return site;
	});
}

function errorHander(err, res, code = HTTP_STATUS.BAD_REQUEST) {
	const customMessage = err.message || err;
	const errorCode = customMessage.code || code;
	return sendErrorResponse({ message: 'Opertion Failed' }, res, errorCode);
}

module.exports = {
	verifyOwner,
	errorHander,
	appBucket
};
