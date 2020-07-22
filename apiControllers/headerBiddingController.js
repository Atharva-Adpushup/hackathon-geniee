/* eslint-disable no-shadow */
/* eslint-disable no-restricted-syntax */
const axios = require('axios').default;
const express = require('express');
const Promise = require('bluebird');
const _get = require('lodash/get');
const userModel = require('../models/userModel');
const siteModel = require('../models/siteModel');
const headerBiddingModel = require('../models/headerBiddingModel');
const httpStatus = require('../configs/httpStatusConsts');
const AdPushupError = require('../helpers/AdPushupError');
const FormValidator = require('../helpers/FormValidator');
const schema = require('../helpers/schema');
const commonConsts = require('../configs/commonConsts');
const adpushup = require('../helpers/adpushupEvent');

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
	.post('/bidder/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const {
			bidderConfig: {
				key,
				name,
				relation,
				sizeLess,
				reusable,
				bids,
				revenueShare,
				isAmpActive,
				isS2SActive
			},
			params
		} = req.body;
		const json = {
			key,
			name,
			sizeLess,
			reusable,
			relation,
			bids,
			revenueShare,
			isAmpActive,
			isS2SActive
		};

		const hbConfig = {
			hbcf: {},
			deviceConfig: { sizeConfig: [] },
			countryConfig: [],
			siteId,
			siteDomain: null,
			email,
			prebidConfig: {
				timeOut: commonConsts.hbGlobalSettingDefaults.prebidTimeout,
				refreshTimeOut: commonConsts.hbGlobalSettingDefaults.prebidRefreshTimeout
			},
			amazonUAMConfig: {
				...commonConsts.amazonUAMConfigDefaults
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
			config: params,
			isActive: true,
			isAmpActive,
			isS2SActive
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
						...biddersFromNetworkConfig[key].params
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
							.then(() => headerBiddingModel.getAllBiddersFromNetworkConfig())
							.then(biddersFromNetworkConfig => {
								bidderConfig.paramsFormFields = {
									...biddersFromNetworkConfig[key].params
								};

								return res.status(httpStatus.OK).json({ bidderKey: key, bidderConfig });
							});
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
			bidderConfig: {
				key,
				name,
				relation,
				sizeLess,
				reusable,
				bids,
				revenueShare,
				status,
				isAmpActive,
				isS2SActive
			},
			params
		} = req.body;
		const json = {
			key,
			name,
			sizeLess,
			reusable,
			relation,
			bids,
			revenueShare,
			status,
			isAmpActive,
			isS2SActive
		};

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
			config: params,
			isActive: true,
			isAmpActive,
			isS2SActive
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
						...biddersFromNetworkConfig[key].params
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
	.delete('/bidder/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const { bidderKey } = req.body || {};

		if (!bidderKey) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Bidder key required' });
		}

		if (!siteId) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Site ID required' });
		}

		return (
			userModel
				.verifySiteOwner(email, siteId)
				.then(() => headerBiddingModel.getHbConfig(siteId))
				// hbConfig found
				.then(hbConfig => hbConfig.deleteBidder(bidderKey))
				.then(hbConfig => hbConfig.save())
				.then(() => res.json({ message: 'Bidder successfully deleted' }))
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
				target: { app, adUnitId },
				enableHB
			} = json;

			if (!app || !adUnitId || typeof enableHB !== 'boolean' || !siteId) {
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
			.then(() => headerBiddingModel.getPrebidConfig(siteId, email))
			.then(prebidConfig => res.status(httpStatus.OK).json(prebidConfig))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	})
	.put('/prebidSettings/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const newPrebidConfig = req.body;
		const { timeOut, refreshTimeOut } = newPrebidConfig;
		const {
			HEADER_BIDDING: { INITIAL_TIMEOUT, REFRESH_TIMEOUT }
		} = commonConsts;

		const isValidInitialTimeout =
			!Number.isNaN(timeOut) && timeOut >= INITIAL_TIMEOUT.MIN && timeOut <= INITIAL_TIMEOUT.MAX;

		const isValidRefreshTimeout =
			!Number.isNaN(refreshTimeOut) &&
			refreshTimeOut >= REFRESH_TIMEOUT.MIN &&
			refreshTimeOut <= REFRESH_TIMEOUT.MAX;

		if (!isValidInitialTimeout || !isValidRefreshTimeout) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid data' });
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getHbConfig(siteId))
			.then(hbConfig => {
				hbConfig.set('prebidConfig', newPrebidConfig);
				return hbConfig.save();
			})
			.then(({ data: { prebidConfig } }) => res.status(httpStatus.OK).json(prebidConfig))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})

	.get('/amazonUAMSettings/:siteId', (req, res) => {
		const { email } = req.user;
		const { siteId } = req.params;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getAmazonUAMConfig(siteId, email))
			.then(amazonUAMConfig => res.status(httpStatus.OK).json(amazonUAMConfig))
			.catch(error => {
				// eslint-disable-next-line no-console
				console.log(error);
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	})

	.put('/amazonUAMSettings/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const amazonUAMConfig = req.body;
		const { timeOut, refreshTimeOut, publisherId } = amazonUAMConfig;

		const {
			AMAZON_UAM: { INITIAL_TIMEOUT, REFRESH_TIMEOUT }
		} = commonConsts;

		const isValidInitialTimeout =
			!Number.isNaN(timeOut) && timeOut >= INITIAL_TIMEOUT.MIN && timeOut <= INITIAL_TIMEOUT.MAX;

		const isValidRefreshTimeout =
			!Number.isNaN(refreshTimeOut) &&
			refreshTimeOut >= REFRESH_TIMEOUT.MIN &&
			refreshTimeOut <= REFRESH_TIMEOUT.MAX;

		if (!isValidInitialTimeout || !isValidRefreshTimeout || !publisherId) {
			return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid data' });
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getHbConfig(siteId))
			.then(hbConfig => {
				hbConfig.set('amazonUAMConfig', amazonUAMConfig);
				return hbConfig.save();
			})
			.then(({ data: { amazonUAMConfig } }) => res.status(httpStatus.OK).json(amazonUAMConfig))
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
	})
	.post('/bidderRule/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const bidderRule = req.body;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => {
				const { bidder, device, status } = bidderRule;
				const json = { bidder, status };
				if (device) json.device = device;

				return FormValidator.validate(json, schema.hbOptimization.validations);
			})
			.then(() => {
				const { device, sizesSupported } = bidderRule;
				const errors = [];
				if (device && (!Array.isArray(sizesSupported) || !sizesSupported.length)) {
					errors.push({ message: 'Ad Sizes are required' });
				}

				if (errors.length) {
					throw new AdPushupError(errors);
				}
			})
			.then(() => headerBiddingModel.saveBidderRule(siteId, bidderRule))
			.then(() => res.status(httpStatus.OK).json({ success: 'Bidder Rule Saved' }))
			.catch(err => {
				if (err instanceof AdPushupError) {
					return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
				}

				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})
	.delete('/bidderRule/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const { bidder } = req.body;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => {
				if (!bidder) throw new AdPushupError('Bidder is required');

				return headerBiddingModel.deleteBidderRule(siteId, bidder);
			})
			.then(() => res.status(httpStatus.OK).json({ success: 'Bidder rule deleted successfully' }))
			.catch(err => {
				if (err instanceof AdPushupError) {
					return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
				}

				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Internal Server Error!' });
			});
	})
	.get('/adserverSetup', (req, res) => {
		const { email } = req.user;

		return userModel
			.getUserByEmail(email)
			.then(user => Promise.join(user, headerBiddingModel.setupAdserver(user)))
			.then(([user, resp]) => {
				let httpStatusCode;
				let message;

				const adServerSetupStatus = user.get('adServerSetupStatus');

				if (resp.status === 'pending' || resp.status === 'in-progress') {
					if (adServerSetupStatus !== 1) user.set('adServerSetupStatus', 1);
					httpStatusCode = 202;
					message = 'Adserver automation is in progress';
				}

				if (resp.status === 'failed') {
					if (adServerSetupStatus !== 3) user.set('adServerSetupStatus', 3);
					httpStatusCode = 502;
					message = 'Adserver automation failed';
				}

				if (resp.status === 'finished') {
					if (adServerSetupStatus !== 2) user.set('adServerSetupStatus', 2);
					httpStatusCode = 200;
					message = 'Adserver automation finished';
				}

				return Promise.join(httpStatusCode, message, user.save());
			})
			.then(([httpStatusCode, message]) => res.status(httpStatusCode).json({ success: message }))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				return res.status(500).json({ success: 'Something went wrong!' });
			});
	})
	.get('/hbInitData/:siteId', (req, res) => {
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
					headerBiddingModel.getMergedBidders(siteId),
					headerBiddingModel.getInventoriesForHB(siteId),
					user
				)
			)
			.then(([biddersFound, inventoryFound, mergedBidders, hbInventories, user]) => {
				const activeAdServerData = user.getActiveAdServerData('dfp');
				const isValidAdServer = !!activeAdServerData && !!activeAdServerData.activeDFPNetwork;
				const isAdpushupDfp =
					activeAdServerData &&
					activeAdServerData.activeDFPNetwork ===
						commonConsts.hbGlobalSettingDefaults.dfpAdUnitTargeting.networkId.toString();
				const dfpConnected = isAdpushupDfp ? undefined : !!user.getNetworkDataObj('DFP');
				const isPublisherActiveDfp =
					isValidAdServer &&
					activeAdServerData.activeDFPNetwork !==
						commonConsts.hbGlobalSettingDefaults.dfpAdUnitTargeting.networkId.toString();
				const adServerSetupStatus = user.get('adServerSetupStatus') || 0;
				const adpushupNetworkCode = isAdpushupDfp
					? commonConsts.hbGlobalSettingDefaults.dfpAdUnitTargeting.networkId
					: undefined;

				return res.status(httpStatus.OK).json({
					setupStatus: {
						dfpConnected,
						inventoryFound,
						biddersFound,
						isAdpushupDfp,
						adpushupNetworkCode,
						isPublisherActiveDfp,
						adServerSetupStatus
					},
					bidders: mergedBidders,
					inventories: hbInventories
				});
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				if (err instanceof AdPushupError)
					return res.status(httpStatus.NOT_FOUND).json({ error: err.message });

				return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong' });
			});
	})
	.get('/startCdnSync/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => {
				adpushup.emit('siteSaved', siteId);

				res.status(httpStatus.OK).json({ success: 'CDN Sync has been Started' });
			})
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong' });
			});
	})

	.put('/updateFormat/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const { inventories } = req.body;

		const categorizedJSON = { layoutEditor: [], apTag: [], innovativeAds: [] };
		for (const inventory of inventories) {
			const { app, adUnitId, format } = inventory;

			if (!app || !adUnitId || !siteId || !format) {
				return res.status(httpStatus.BAD_REQUEST).json({ error: 'Invalid data received' });
			}

			switch (app) {
				case 'Layout Editor': {
					categorizedJSON.layoutEditor.push(inventory);
					break;
				}
				case 'AP Tag': {
					categorizedJSON.apTag.push(inventory);
					break;
				}
				case 'Innovative Ads': {
					categorizedJSON.innovativeAds.push(inventory);
					break;
				}
				default:
			}
		}

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.updateFormats(siteId, categorizedJSON))
			.then(() => res.status(httpStatus.OK).json({ success: 'Format updated successfully' }))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' })
			);
	})
	.get('/rules/meta', (req, res) => {
		const apis = {
			devices:
				'https://api.adpushup.com/CentralReportingWebService/site/list?list_name=GET_ALL_DEVICES',
			countries:
				'https://api.adpushup.com/CentralReportingWebService/site/list?list_name=GET_ALL_COUNTRIES',
			days:
				'https://api.adpushup.com/CentralReportingWebService/hb_analytics/list?list_name=GET_ALL_DAY_TYPES',
			adTypes:
				'https://api.adpushup.com/CentralReportingWebService/hb_analytics/list?list_name=GET_AD_TYPE_OPTIONS',
			timeSlots:
				'https://api.adpushup.com/CentralReportingWebService/hb_analytics/list?list_name=GET_TIME_OF_AUCTION_BUCKETS'
		};

		const fetchDataFromAPI = api => axios.get(api);
		const getDataFromAPIResponse = response =>
			(response.data &&
				response.data.description === 'SUCCESS' &&
				response.data.data &&
				response.data.data.result) ||
			[];

		const fieldsIgnored = {
			countries: {
				XX: true
			}
		};

		const fieldsRequired = {
			adTypes: { banner: true, native: true, video: true },
			devices: { mobile: true, tablet: true, desktop: true }
		};

		const fieldsToBeReplaced = {
			adTypes: {
				label: { Banner: 'Display' },
				value: { banner: 'display' }
			}
		};

		// eslint-disable-next-line consistent-return
		const getKeysToBeUsed = type => {
			switch (type) {
				case 'countries':
					return { labelKey: 'value', valueKey: 'country_code_alpha2' };

				default:
					return { labelKey: 'value', valueKey: 'ext' };
			}
		};

		const getConvertedDataFromAPI = (response, dataType) => {
			const data = getDataFromAPIResponse(response);

			const fieldsIgnoredForDataType = fieldsIgnored[dataType];
			const fieldsRequiredForDataType = fieldsRequired[dataType];
			const fieldsToBeReplacedForDataType = fieldsToBeReplaced[dataType];

			const { labelKey, valueKey } = getKeysToBeUsed(dataType);

			return data.reduce((result, item) => {
				const label = item[labelKey];
				const value = item[valueKey];

				// has fields required ?
				if (fieldsRequiredForDataType) {
					const isFieldRequired = _get(fieldsRequiredForDataType, value, false);
					if (!isFieldRequired) return result;
				}

				// has fields to be ignored ?
				if (fieldsIgnoredForDataType) {
					const isFieldIgnored = _get(fieldsIgnoredForDataType, value, false);
					if (isFieldIgnored) return result;
				}

				// get label and value replacements to be used
				const convertedItem = {};
				convertedItem.label = _get(fieldsToBeReplacedForDataType, `label.${label}`, label);
				convertedItem.value = _get(fieldsToBeReplacedForDataType, `value.${value}`, value);

				result.push(convertedItem);

				return result;
			}, []);
		};

		axios
			.all([
				fetchDataFromAPI(apis.countries),
				fetchDataFromAPI(apis.devices),
				fetchDataFromAPI(apis.days),
				fetchDataFromAPI(apis.timeSlots),
				fetchDataFromAPI(apis.adTypes)
			])
			.then(
				axios.spread((countries, devices, days, timeSlots, adTypes) => ({
					days: getConvertedDataFromAPI(days, 'days'),
					adTypes: getConvertedDataFromAPI(adTypes, 'adTypes'),
					devices: getConvertedDataFromAPI(devices, 'devices'),
					countries: getConvertedDataFromAPI(countries, 'countries'),
					timeSlots: getConvertedDataFromAPI(timeSlots, 'timeSlots')
				}))
			)
			.then(data => res.send(data))
			.catch(error => res.status(httpStatus.BAD_REQUEST).send(error.message));
	})
	.get('/rules/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => headerBiddingModel.getHbConfig(siteId, email))
			.then(hbConfig => hbConfig.get('rules') || [])
			.then(rules => res.status(httpStatus.OK).json(rules))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	})
	.post('/rules/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const { rule } = req.body;

		const newRule = { ...rule, createdAt: new Date().getTime() };

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => FormValidator.validate(rule, schema.hbRules.rule))
			.then(() => headerBiddingModel.getHbConfig(siteId, email))
			.then(hbConfig => {
				const rules = hbConfig.get('rules') || [];
				hbConfig.set('rules', [...rules, newRule]);
				return hbConfig.save();
			})
			.then(({ data: { rules } }) => res.status(httpStatus.OK).json(rules))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				if (err instanceof AdPushupError) {
					return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
				}

				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	})
	.put('/rules/:siteId', (req, res) => {
		const { siteId } = req.params;
		const { email } = req.user;
		const { rule, ruleIndex } = req.body;

		return userModel
			.verifySiteOwner(email, siteId)
			.then(() => FormValidator.validate(rule, schema.hbRules.rule))
			.then(() => {
				const parsedRuleIndex = parseInt(ruleIndex, 10);
				if (Number.isNaN(parsedRuleIndex)) {
					throw new AdPushupError('Invalid data given to edit rule');
				}
			})
			.then(() => headerBiddingModel.getHbConfig(siteId, email))
			.then(hbConfig => {
				const rules = hbConfig.get('rules') || [];

				if (rules.length <= ruleIndex) {
					throw new AdPushupError('Invalid data given to edit rule');
				}

				rules[ruleIndex] = { ...rules[ruleIndex], ...rule };

				hbConfig.set('rules', rules);
				return hbConfig.save();
			})
			.then(({ data: { rules } }) => res.status(httpStatus.OK).json(rules))
			.catch(err => {
				// eslint-disable-next-line no-console
				console.log(err);

				if (err instanceof AdPushupError) {
					return res.status(httpStatus.BAD_REQUEST).json({ error: err.message });
				}

				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error!' });
			});
	});

module.exports = router;
