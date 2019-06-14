/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */
const express = require('express');
const Promise = require('bluebird');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const headerBiddingModel = require('../models/headerBiddingModel');
const httpStatus = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');
const FormValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');

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
	.get('/getInventorySizes/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		return (
			userModel
				.verifySiteOwner(email, siteId)
				.then(() => siteModel.getUniqueInventorySizes(siteId))
				.then(sizesArray => res.status(httpStatus.OK).json(sizesArray))
				// eslint-disable-next-line no-unused-vars
				.catch(err =>
					res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
				)
		);
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
						Promise.resolve(true),
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
	})
	.post('/bidder/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const {
			bidderConfig: { key, name, relation, sizeLess, reusable, bids, revenueShare },
			params
		} = req.body;
		const json = { key, name, sizeLess, reusable, relation, bids, revenueShare };

		const hbConfig = {
			hbcf: {},
			deviceConfig: {},
			countryConfig: {},
			siteId,
			siteDomain: null,
			email,
			prebidConfig: {
				timeOut: 3000,
				currency: {
					enabled: false
				},
				formats: ['display']
			}
		};

		const bidderConfig = {
			name,
			isApRelation: relation === 'adpushup',
			isPaused: false,
			sizeLess,
			reusable,
			relation,
			bids,
			revenueShare,
			config: params
		};

		return (
			userModel
				.verifySiteOwner(email, siteId)
				.then(({ user }) =>
					Promise.all([
						FormValidator.validate(json, schema.hbAPI.validations),
						user.getSiteById(Number(siteId))
					])
				)
				// Check hbConfig
				// eslint-disable-next-line no-unused-vars
				.then(([validated, { domain: siteDomain }]) => {
					if (!params || !Object.keys(params).length) {
						throw new AdPushupError('Atleast 1 prebid param required');
					}

					hbConfig.siteDomain = siteDomain;

					return headerBiddingModel.getHbConfig(siteId);
				})
				// hbConfig found OR created new hbConfig
				.then(hbConfig => hbConfig.saveBidderConfig(key, bidderConfig))
				.then(hbConfig => hbConfig.save())
				.then(() => headerBiddingModel.getAllBiddersFromNetworkConfig())
				.then(biddersFromNetworkConfig => {
					bidderConfig.paramsFormFields = {
						...biddersFromNetworkConfig[key].params.global,
						...biddersFromNetworkConfig[key].params.siteLevel
					};

					return res.status(httpStatus.OK).json({ bidderKey: key, bidderConfig });
				})
				.catch(err => {
					// eslint-disable-next-line no-console
					console.log(err);

					// hbConfig not found
					if (err instanceof AdPushupError && err.message.status === 404) {
						return headerBiddingModel
							.createHBConfigFromJson(hbConfig, key, bidderConfig)
							.then(() => res.status(httpStatus.OK).json({ bidderKey: key, bidderConfig }));
					}

					if (err instanceof AdPushupError && Array.isArray(err.message)) {
						return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
					}

					return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
				})
		);
	})
	.put('/bidder/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const {
			bidderConfig: { key, name, relation, sizeLess, reusable, bids, revenueShare, status },
			params
		} = req.body;
		const json = { key, name, sizeLess, reusable, relation, bids, revenueShare, status };

		const hbConfig = {
			hbcf: {},
			deviceConfig: {},
			countryConfig: {},
			siteId,
			siteDomain: null,
			email,
			prebidConfig: {}
		};

		const bidderConfig = {
			name,
			isApRelation: relation === 'adpushup',
			isPaused: status === 'paused',
			sizeLess,
			reusable,
			relation,
			bids,
			revenueShare,
			config: params
		};

		return (
			userModel
				.verifySiteOwner(email, siteId)
				.then(({ user }) =>
					Promise.all([
						FormValidator.validate(json, schema.hbAPI.validations),
						user.getSiteById(Number(siteId))
					])
				)
				// Check hbConfig
				// eslint-disable-next-line no-unused-vars
				.then(([validated, { domain: siteDomain }]) => {
					if (!params || !Object.keys(params).length) {
						throw new AdPushupError('Atleast 1 prebid param required');
					}

					hbConfig.siteDomain = siteDomain;

					return headerBiddingModel.getHbConfig(siteId);
				})
				// hbConfig not found
				.catch(err => {
					if (err instanceof AdPushupError && err.message.status === 404) {
						return headerBiddingModel.createHBConfigFromJson(hbConfig, key, bidderConfig);
					}

					throw err;
				})
				// hbConfig found OR created new hbConfig
				.then(hbConfig => hbConfig.saveBidderConfig(key, bidderConfig))
				.then(hbConfig => hbConfig.save())
				.then(() => headerBiddingModel.getAllBiddersFromNetworkConfig())
				.then(biddersFromNetworkConfig => {
					bidderConfig.paramsFormFields = {
						...biddersFromNetworkConfig[key].params.global,
						...biddersFromNetworkConfig[key].params.siteLevel
					};

					return res.status(httpStatus.OK).json({ bidderKey: key, bidderConfig });
				})
				.catch(err => {
					// eslint-disable-next-line no-console
					console.log(err);
					if (err instanceof AdPushupError && Array.isArray(err.message)) {
						return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
					}

					return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
				})
		);
	})
	.get('/inventory/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		return (
			userModel
				.verifySiteOwner(email, siteId)
				.then(() => headerBiddingModel.getInventoriesForHB(siteId))
				.then(inventories => res.status(httpStatus.OK).json(inventories))
				// eslint-disable-next-line no-unused-vars
				.catch(err =>
					res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
				)
		);
	})
	.put('/updateHbStatus/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		const categorizedJSON = { layoutEditor: [], apTag: [], innovativeAds: [] };
		for (const json of req.body) {
			const {
				target: { app, adUnit },
				enableHB
			} = json;

			if (!app || !adUnit || typeof enableHB !== 'boolean' || !siteId) {
				return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid data received' });
			}

			switch (app) {
				case 'Layout Editor': {
					categorizedJSON.layoutEditor.push(json);
					break;
				}
				case 'AP Tag': {
					categorizedJSON.apTag.push(json);
					break;
				}
				case 'Innovative Ads': {
					categorizedJSON.innovativeAds.push(json);
					break;
				}
				default:
			}
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.updateHbStatus(siteId, categorizedJSON))
			.then(() =>
				res.status(httpStatus.OK).json({ success: 'HB Status has been updated successfully' })
			)
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.get('/prebidSettings/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getPrebidConfig(siteId))
			.then(prebidConfig => res.status(httpStatus.OK).json(prebidConfig))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.put('/prebidSettings/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const newPrebidConfig = req.body;
		const { timeOut, currency, formats } = newPrebidConfig;

		if (
			!(
				!Number.isNaN(timeOut) &&
				timeOut >= 500 &&
				timeOut <= 10000 &&
				typeof currency.enabled === 'boolean' &&
				formats.indexOf('display') > -1
			)
		) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid data' });
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.updatePrebidConfig(siteId, newPrebidConfig))
			.then(prebidConfig => res.status(httpStatus.OK).json(prebidConfig))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.get('/hbStatusForSite/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getHbStatusForSite(siteId))
			.then(hbStatus => res.status(httpStatus.OK).json(hbStatus))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.put('/toggleHbStatusForSite/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.toggleHbStatusForSite(siteId))
			.then(hbStatus => res.status(httpStatus.OK).json(hbStatus))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.get('/optimizationTabInitData/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() =>
				Promise.all([
					headerBiddingModel.getBidderRules(siteId),
					headerBiddingModel.getAddedBiddersNames(siteId)
				])
			)
			.then(([bidderRules, addedBidders]) =>
				res.status(httpStatus.OK).json({ bidderRules, addedBidders })
			)
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	});

module.exports = router;
