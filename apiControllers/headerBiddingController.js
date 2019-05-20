/* eslint-disable no-restricted-syntax */
const express = require('express');
const Promise = require('bluebird');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const headerBiddingModel = require('../models/headerBiddingModel');
const httpStatus = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');

const router = express.Router();

router
	.get('/isInventoryExist/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => siteModel.isInventoryExist(siteId))
			.then(() => res.status(httpStatus.OK).json({ success: 'Inventory found!' }))
			.catch(err => {
				if (err instanceof AdPushupError)
					return res.status(httpStatus.NOT_FOUND).json({ error: 'Inventory not found!' });
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})
	.get('/getBiddersList/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getMergedBidders(siteId))
			.then(mergedBidders => res.status(httpStatus.OK).json(mergedBidders))
			.catch(err => {
				if (err instanceof AdPushupError)
					return res.status(httpStatus.NOT_FOUND).json({ error: err.message });
				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})
	.get('/setupStatus/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(({ user }) =>
				Promise.join(
					headerBiddingModel
						.getHbConfig(siteId)
						.then(hbConfig => hbConfig.getUsedBidders())
						.then(bidders => !!Object.keys(bidders).length)
						.catch(() => false),
					siteModel.isInventoryExist(siteId).catch(() => false),
					user
				)
			)
			.then(([biddersFound, inventoryFound, user]) => {
				if (!biddersFound) {
					// Check DFP In-Line Items automation
					// sending not found temporarily
					return Promise.join(
						biddersFound,
						inventoryFound,
						Promise.resolve(false),
						!!user.getNetworkDataObj('DFP')
					);
				}

				// if bidders exist then no need to
				// check dfp inline items and dfp auth
				return Promise.join(
					biddersFound,
					inventoryFound,
					true, // adServerSetupCompleted
					true // dfpConnected
				);
			})
			.then(([biddersFound, inventoryFound, adServerSetupCompleted, dfpConnected]) =>
				res
					.status(httpStatus.OK)
					.json({ dfpConnected, adServerSetupCompleted, inventoryFound, biddersFound })
			)
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
			});
	});

module.exports = router;
