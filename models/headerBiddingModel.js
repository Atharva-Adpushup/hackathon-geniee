module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const schema = require('../helpers/schema');
const FormValidator = require('../helpers/FormValidator');
const utils = require('../helpers/utils');
const siteModel = require('./siteModel');
const userModel = require('./userModel');
const channelModel = require('./channelModel');

const HeaderBidding = model.extend(function() {
	this.keys = [
		'hbcf',
		'deviceConfig',
		'countryConfig',
		'siteId',
		'siteDomain',
		'email',
		'prebidConfig'
	];
	this.clientKeys = [
		'hbcf',
		'deviceConfig',
		'countryConfig',
		'siteId',
		'siteDomain',
		'email',
		'prebidConfig'
	];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = { hbcf: {}, deviceConfig: { sizeConfig: [] }, countryConfig: [] };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain && data.email)) {
			throw new Error('siteId, siteDomain and publisher email required for header bidding doc');
		}
		this.key = `hbcf::${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
	this.getUsedBidders = function() {
		return this.get('hbcf');
	};
	this.saveBidderConfig = function(bidderKey, bidderConfig) {
		const hbcf = this.get('hbcf');
		hbcf[bidderKey] = bidderConfig;
		return Promise.resolve(this);
	};
});

function apiModule() {
	const API = {
		createHBConfigFromJson(json, bidderKey, bidderConfig) {
			return Promise.resolve(new HeaderBidding(json))
				.then(hbConfig => hbConfig.saveBidderConfig(bidderKey, bidderConfig))
				.then(hbConfig => hbConfig.save());
		},
		getAllBiddersFromNetworkConfig() {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync('data::apNetwork'))
				.then(({ value: networks }) => {
					const hbBidders = {};

					for (const key in networks) {
						if (key !== 'adpTags' && networks[key].isHb && networks[key])
							hbBidders[key] = networks[key];
					}

					return hbBidders;
				});
		},
		getUsedBidders(siteId) {
			return API.getHbConfig(siteId)
				.then(hbConfig => hbConfig.getUsedBidders())
				.catch(err => {
					if (err instanceof AdPushupError && err.message.status === 404) {
						return {};
					}

					throw err;
				});
		},
		getMergedBidders(siteId) {
			return Promise.all([API.getAllBiddersFromNetworkConfig(), API.getUsedBidders(siteId)]).then(
				([allBidders, addedBidders]) => {
					const notAddedBidders = { ...allBidders };

					// delete added bidders keys from all bidders
					for (const addedBidderKey in addedBidders) {
						if (!notAddedBidders[addedBidderKey]) throw new AdPushupError('Invalid bidders added');

						addedBidders[addedBidderKey].paramsFormFields = {
							...notAddedBidders[addedBidderKey].params
						};
						addedBidders[addedBidderKey].isActive = notAddedBidders[addedBidderKey].isActive;

						delete notAddedBidders[addedBidderKey];
					}

					for (const key in notAddedBidders) {
						if (notAddedBidders.hasOwnProperty(key) && !notAddedBidders[key].isActive) {
							delete notAddedBidders[key];
						}
					}

					return { addedBidders, notAddedBidders };
				}
			);
		},
		mergeBidderParams(networkConfigBidderparams, addedBidderParams) {
			const mergedBidderparams = { ...addedBidderParams };
			for (const paramKey in mergedBidderparams) {
				const value = mergedBidderparams[paramKey];
				mergedBidderparams[paramKey] = {
					value,
					...networkConfigBidderparams[paramKey]
				};
			}

			return mergedBidderparams;
		},
		getHbConfig(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`))
				.then(json => new HeaderBidding(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError({
							status: 404,
							message: 'Header Bidding Config does not exist'
						});
					}

					return false;
				});
		},
		getLayoutInventoriesForHB: siteId =>
			siteModel
				.getSiteById(siteId)
				.then(site => site.getAllChannels())
				.then(channels => {
					const inventories = [];

					// eslint-disable-next-line no-restricted-syntax
					for (const channel of channels) {
						const { pageGroup, platform: device } = channel;
						const inventory = { app: 'Layout Editor', pageGroup, device };

						// eslint-disable-next-line no-restricted-syntax
						if (channel.variations && Object.keys(channel.variations).length) {
							for (const variationKey in channel.variations) {
								const variation = channel.variations[variationKey];
								inventory.variationName = variation.name;

								if (variation.sections && Object.keys(variation.sections).length) {
									for (const sectionKey in variation.sections) {
										const section = variation.sections[sectionKey];

										if (section.ads && Object.keys(section.ads).length) {
											for (const adKey in section.ads) {
												const ad = section.ads[adKey];

												if (ad.network === 'adpTags') {
													const { headerBidding, dfpAdunit: adUnit } = ad.networkData;
													inventory.headerBidding = headerBidding ? 'Enabled' : 'Disabled';
													inventory.adUnit = adUnit;
													inventories.push({ ...inventory });
												}
											}
										} else {
											continue;
										}
									}
								} else {
									continue;
								}
							}
						} else {
							continue;
						}
					}

					return inventories;
				}),
		getApTagInventoriesForHB: siteId =>
			couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`tgmr::${siteId}`, {}))
				.then(({ value }) => {
					const inventories = [];
					if (value.ads.length) {
						for (const ad of value.ads) {
							const inventory = {
								app: 'AP Tag',
								pageGroup: 'N/A',
								device: 'N/A',
								variationName: 'N/A'
							};

							if (ad.network === 'adpTags') {
								const { headerBidding, dfpAdunit: adUnit } = ad.networkData;
								inventory.headerBidding = headerBidding ? 'Enabled' : 'Disabled';
								inventory.adUnit = adUnit;

								inventories.push({ ...inventory });
							}
						}
					}

					return inventories;
				})
				.catch(err => {
					if (err.code === 13) {
						return [];
					}

					throw err;
				}),
		getInnovativeAdInventoriesForHB: siteId =>
			couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`fmrt::${siteId}`, {}))
				.then(({ value }) => {
					const inventories = [];
					if (value.ads.length) {
						for (const ad of value.ads) {
							const [, device, pageGroup] = ad.pagegroups[0].match(/(.*):(.*)/);
							const inventory = { app: 'Innovative Ads', pageGroup, device, variationName: 'ALL' };

							if (ad.network === 'adpTags') {
								const { headerBidding, dfpAdunit: adUnit } = ad.networkData;
								inventory.headerBidding = headerBidding ? 'Enabled' : 'Disabled';
								inventory.adUnit = adUnit;

								inventories.push({ ...inventory });
							}
						}
					}

					return inventories;
				})
				.catch(err => {
					if (err.code === 13) {
						return [];
					}

					throw err;
				}),
		getInventoriesForHB: siteId =>
			Promise.all([
				API.getLayoutInventoriesForHB(siteId),
				API.getApTagInventoriesForHB(siteId),
				API.getInnovativeAdInventoriesForHB(siteId)
			]).then(([layoutInventories, apTagInventories, innovativeAdsInventories]) => {
				const inventories = [
					...layoutInventories,
					...apTagInventories,
					...innovativeAdsInventories
				];

				return inventories;
			}),
		updateHbStatusOnLayoutInventory: (siteId, json) => {
			if (!json || !json.length) {
				return Promise.resolve();
			}

			const jsonByChannels = {};
			for (const obj of json) {
				const {
					target: { device, pageGroup, adUnit },
					enableHB
				} = obj;
				const key = `${device}:${pageGroup}`;

				if (!jsonByChannels[key]) {
					jsonByChannels[key] = { list: [] };
				}

				if (!jsonByChannels[key].device && !jsonByChannels[key].pageGroup) {
					jsonByChannels[key].device = device;
					jsonByChannels[key].pageGroup = pageGroup;
				}

				jsonByChannels[key].list.push({ adUnit, enableHB });
			}

			const promiseArr = [];
			for (const objKey in jsonByChannels) {
				const { device, pageGroup, list: inventoryArr } = jsonByChannels[objKey];

				promiseArr.push(
					channelModel.getChannel(siteId, device, pageGroup).then(channel => {
						const { data: channelData } = channel;

						for (const inventory of inventoryArr) {
							// eslint-disable-next-line no-restricted-syntax
							if (channelData.variations && Object.keys(channelData.variations).length) {
								for (const variationKey in channelData.variations) {
									const variation = channelData.variations[variationKey];
									if (variation.sections && Object.keys(variation.sections).length) {
										for (const sectionKey in variation.sections) {
											const section = variation.sections[sectionKey];

											if (section.ads && Object.keys(section.ads).length) {
												for (const adKey in section.ads) {
													const ad = section.ads[adKey];

													if (
														ad.network === 'adpTags' &&
														ad.networkData &&
														ad.networkData.dfpAdunit === inventory.adUnit &&
														ad.networkData.headerBidding !== inventory.enableHB
													) {
														ad.networkData.headerBidding = inventory.enableHB;
													}

													continue;
												}
											} else {
												continue;
											}
										}
									} else {
										continue;
									}
								}
							} else {
								throw new AdPushupError('Target Inventory not found');
							}
						}

						return channel.save();
					})
				);
			}

			return Promise.all(promiseArr);
		},
		updateHbStatusOnApTagInventory: (siteId, json) => {
			if (!json || !json.length) {
				return Promise.resolve();
			}

			return couchbase
				.connectToAppBucket()
				.then(appBucket =>
					appBucket.getAsync(`tgmr::${siteId}`, {}).then(apTagDoc => ({ appBucket, apTagDoc }))
				)
				.then(({ appBucket, apTagDoc: { value } }) => {
					for (const inventory of json) {
						for (const ad of value.ads) {
							if (
								ad.network === 'adpTags' &&
								ad.networkData &&
								ad.networkData.dfpAdunit === inventory.target.adUnit &&
								ad.networkData.headerBidding !== inventory.enableHB
							) {
								ad.networkData.headerBidding = inventory.enableHB;
							}
						}
					}

					return appBucket.replaceAsync(`tgmr::${siteId}`, value, { expiry: 1296000 });
				})
				.catch(err => {
					if (err.code === 13) {
						return [];
					}

					throw err;
				});
		},
		updateHbStatusOnInnovAdInventory: (siteId, json) => {
			if (!json || !json.length) {
				return Promise.resolve();
			}
			return couchbase
				.connectToAppBucket()
				.then(appBucket =>
					appBucket.getAsync(`fmrt::${siteId}`, {}).then(apTagDoc => ({ appBucket, apTagDoc }))
				)
				.then(({ appBucket, apTagDoc: { value } }) => {
					for (const inventory of json) {
						for (const ad of value.ads) {
							if (
								ad.network === 'adpTags' &&
								ad.networkData &&
								ad.networkData.dfpAdunit === inventory.target.adUnit &&
								ad.networkData.headerBidding !== inventory.enableHB
							) {
								ad.networkData.headerBidding = inventory.enableHB;
							}
						}
					}

					return appBucket.replaceAsync(`fmrt::${siteId}`, value, { expiry: 1296000 });
				})
				.catch(err => {
					if (err.code === 13) {
						return [];
					}

					throw err;
				});
		},
		updateHbStatus: (siteId, json, enableHB) =>
			Promise.all([
				API.updateHbStatusOnLayoutInventory(siteId, json.layoutEditor),
				API.updateHbStatusOnApTagInventory(siteId, json.apTag),
				API.updateHbStatusOnInnovAdInventory(siteId, json.innovativeAds)
			]),
		getPrebidConfig: (siteId, email) =>
			Promise.all([API.getHbConfig(siteId), userModel.getUserByEmail(email)]).then(
				([hbConfig, user]) => {
					const prebidConfig = hbConfig.get('prebidConfig');
					// const { activeDFPNetwork, activeDFPCurrencyCode } = site.get('apConfigs');
					const adNetworkSettings = user.getNetworkDataObj('DFP');
					const currencyCode =
						adNetworkSettings &&
						adNetworkSettings.dfpAccounts &&
						adNetworkSettings.dfpAccounts[0].currencyCode;
					const mergedPrebidConfig = { ...prebidConfig };

					mergedPrebidConfig.adServer = adNetworkSettings ? 'AP' : 'Publisher';
					mergedPrebidConfig.currency.code = currencyCode || '';
					mergedPrebidConfig.availableFormats = [
						{ name: 'Display', value: 'display' },
						{ name: 'Native', value: 'native' },
						{ name: 'Video', value: 'video' }
					];

					return mergedPrebidConfig;
				}
			),
		updatePrebidConfig: (siteId, newPrebidConfig) =>
			API.getHbConfig(siteId)
				.then(hbConfig => {
					hbConfig.set('prebidConfig', newPrebidConfig);
					return hbConfig.save();
				})
				.then(({ data: { prebidConfig } }) => prebidConfig),
		getHbStatusForSite: siteId =>
			siteModel.getSiteById(siteId).then(site => {
				const { headerBidding } = site.get('apps');
				return { headerBidding };
			}),
		toggleHbStatusForSite: siteId =>
			siteModel
				.getSiteById(siteId)
				.then(site => {
					const apps = site.get('apps');
					apps.headerBidding = !apps.headerBidding;
					site.set('apps', apps);
					return site.save();
				})
				.then(site => {
					const { headerBidding } = site.get('apps');
					return { headerBidding };
				}),
		getBidderRules: siteId =>
			API.getHbConfig(siteId).then(hbConfig => {
				const deviceConfig = hbConfig.get('deviceConfig');
				const countryConfig = hbConfig.get('countryConfig');

				const { sizeConfig } = deviceConfig;
				const bidderRuleSchema = {
					bidder: '',
					device: '',
					sizesSupported: null,
					country: '',
					status: null
				};
				const bidderRulesObj = {};

				for (const config of sizeConfig) {
					const { bidder, status, sizesSupported, labels } = config;

					if (!bidderRulesObj[bidder]) {
						bidderRulesObj[bidder] = {
							...bidderRuleSchema,
							bidder,
							device: labels[0],
							sizesSupported,
							status
						};
					}
				}

				for (const config of countryConfig) {
					const { bidder, status, labels } = config;
					const bidderRule = bidderRulesObj[bidder];

					if (!bidderRule) {
						bidderRulesObj[bidder] = {
							...bidderRuleSchema,
							bidder,
							country: labels[0],
							status
						};
					}

					if (bidderRule) {
						if (bidderRule.status !== status) {
							throw new AdPushupError("device and country bidder config status didn't match");
						}

						bidderRulesObj[bidder] = {
							...bidderRule,
							country: labels[0]
						};
					}
				}

				const bidderRulesArr = Object.keys(bidderRulesObj).map(
					bidderKey => bidderRulesObj[bidderKey]
				);

				return bidderRulesArr;
			}),
		getAddedBiddersNames: siteId =>
			API.getMergedBidders(siteId).then(({ addedBidders }) => {
				const addedBiddersNames = {};

				for (const [bidderCode, { name: bidderName, isActive }] of Object.entries(addedBidders)) {
					if (isActive) addedBiddersNames[bidderCode] = bidderName;
				}

				return addedBiddersNames;
			}),
		saveBidderRule: (siteId, bidderRule) => {
			const { bidder, device, sizesSupported, country, status } = bidderRule;
			const mediaQueries = {
				desktop: '(min-width: 1200px)',
				tablet: '(min-width: 768px) and (max-width: 1199px)',
				phone: '(min-width: 0px) and (max-width: 767px)'
			};

			return API.getHbConfig(siteId).then(hbConfig => {
				const { sizeConfig } = hbConfig.get('deviceConfig');
				const countryConfig = hbConfig.get('countryConfig');

				const sizeRuleIndex = sizeConfig.findIndex(obj => obj.bidder === bidder);
				const countryRuleIndex = countryConfig.findIndex(obj => obj.bidder === bidder);

				if (sizeRuleIndex > -1) {
					if (device)
						sizeConfig[sizeRuleIndex] = {
							bidder,
							status,
							mediaQuery: mediaQueries[device],
							sizesSupported,
							labels: [device]
						};

					if (!device) sizeConfig.splice(sizeRuleIndex, 1);
				}

				if (sizeRuleIndex === -1 && device) {
					sizeConfig.push({
						bidder,
						status,
						mediaQuery: mediaQueries[device],
						sizesSupported,
						labels: [device]
					});
				}

				if (countryRuleIndex > -1) {
					if (country)
						countryConfig[countryRuleIndex] = {
							bidder,
							status,
							labels: [country]
						};
					if (!country) countryConfig.splice(countryRuleIndex, 1);
				}

				if (countryRuleIndex === -1 && country) {
					countryConfig.push({
						bidder,
						status,
						labels: [country]
					});
				}

				return hbConfig.save();
			});
		},
		deleteBidderRule: (siteId, bidder) =>
			API.getHbConfig(siteId).then(hbConfig => {
				const { sizeConfig } = hbConfig.get('deviceConfig');
				const countryConfig = hbConfig.get('countryConfig');

				const sizeRuleIndex = sizeConfig.findIndex(obj => obj.bidder === bidder);
				const countryRuleIndex = countryConfig.findIndex(obj => obj.bidder === bidder);

				if (sizeRuleIndex > -1) sizeConfig.splice(sizeRuleIndex, 1);

				if (countryRuleIndex > -1) countryConfig.splice(countryRuleIndex, 1);

				return hbConfig.save();
			})
	};

	return API;
}
