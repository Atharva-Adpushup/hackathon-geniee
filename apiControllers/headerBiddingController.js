/* eslint-disable no-restricted-syntax */
const express = require('express');

const router = express.Router();
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const httpStatus = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');

router.get('/isInventoryExist/:siteId', (req, res) => {
	const { siteId } = req.params;
	const { email } = req.user;
	return userModel
		.verifySiteOwner(email, siteId)
		.then(() => siteModel.isLayoutInventoryExist(siteId))
		.catch(() => siteModel.isApTagInventoryExist(siteId))
		.catch(() => siteModel.isInnovativeAdInventoryExist(siteId))
		.then(() => res.status(httpStatus.OK).json({ success: 'Inventory found!' }))
		.catch(err => {
			if (err instanceof AdPushupError)
				return res.status(httpStatus.NOT_FOUND).json({ error: 'Inventory not found!' });
			return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
		});
});

module.exports = router;
