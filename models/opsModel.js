module.exports = apiModule();

const { N1qlQuery } = require('couchbase');
const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');
// const clonedeep = require('lodash.clonedeep');

const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const commonConsts = require('../configs/commonConsts');
const proxy = require('../helpers/proxy');
const config = require('../configs/config');
const siteModel = require('./siteModel');

const axios = require('axios');
const { AMP_SETTINGS_ACCESS_EMAILS } = require('../configs/commonConsts');
const { getActiveProductFromCouchbase } = require('../helpers/routeHelpers');
const { makeReportingRequest } = require('../helpers/commonFunctions');

const commonSiteFunctions = {
	getLayoutInventories: siteId =>
		siteModel
			.getSiteById(siteId)
			.then(site => site.getAllChannels())
			.then(channels => {
				const inventories = [];
				for (const channel of channels) {
					const { pageGroup, platform: device } = channel;
					const inventory = {};
					if (channel.variations && Object.keys(channel.variations).length) {
						for (const variationKey in channel.variations) {
							const variation = channel.variations[variationKey];

							if (variation.sections && Object.keys(variation.sections).length) {
								for (const sectionKey in variation.sections) {
									const section = variation.sections[sectionKey];
									const { enableLazyLoading = false } = section;
									if (section.ads && Object.keys(section.ads).length) {
										for (const adKey in section.ads) {
											const ad = section.ads[adKey];
											// ad->networkData->formats (Also default value is format if none is found)
											if (ad.network === 'adpTags') {
												inventory.key = 'chnl::' + siteId + ':' + device + ':' + pageGroup;
												ad.siteId = siteId;
												ad.siteDomain = channel.siteDomain;
												ad.adId = adKey;
												ad.enableLazyLoading = enableLazyLoading;
												inventory.value = ad;
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
			})
			.catch(err => {
				return [];
			}),
	//for ApTag , Innovative , Amp Ads
	getAdsInventories: (siteId, type) =>
		couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(`${type}::${siteId}`, {}))
			.then(({ value }) => {
				//ampd
				const inventories = [];
				if (value.ads.length) {
					for (const ad of value.ads) {
						const inventory = {};
						if (ad.network === 'adpTags') {
							inventory.key = `${type}::${siteId}`;
							ad.siteId = siteId;
							ad.siteDomain = value.siteDomain;
							ad.adId = ad.id;
							inventory.value = ad;
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

	getApLiteInventories: siteId =>
		couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(`aplt::${siteId}`, {}))
			.then(({ value }) => {
				const inventories = [];
				if (value.adUnits.length) {
					for (const ad of value.adUnits) {
						const inventory = {};
						inventory.key = `aplt::${siteId}`;
						ad.siteId = siteId;
						inventory.value = ad;
						inventories.push(inventory);
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
	isActiveHbBidder(network, key) {
		return network.isActive && network.isHb && key !== 'adpTags';
	},
	getActiveInactiveBidderNames(addedBidders = {}, networkTree = {}) {
		const activeBidders = [];
		const inactiveBidders = [];

		for (const key1 in networkTree) {
			const network = networkTree[key1];
			if (networkTree.hasOwnProperty(key1) && commonSiteFunctions.isActiveHbBidder(network, key1)) {
				const currentAddedBidder = addedBidders[key1];
				if (currentAddedBidder && currentAddedBidder.isActive && !currentAddedBidder.isPaused) {
					activeBidders.push(currentAddedBidder.name);
				} else {
					inactiveBidders.push(network.name);
				}
			}
		}

		return { activeBidders, inactiveBidders };
	},
	getOnboardingStatus(onboardingStep, apps = {}) {
		if (onboardingStep > 3) {
			return 'Onboarded';
		}
		switch (onboardingStep) {
			case 1: {
				return 'AP Head Code is Missing';
			}

			case 2: {
				return 'Ads.txt is Missing';
			}

			case 3: {
				for (const app in apps) {
					if (apps.hasOwnProperty('app') && apps[app]) {
						return 'Onboarded: App Activated';
					}
				}
				return 'Onboarded: No Apps Activated';
			}

			default:
				return 'N/A';
		}
	},
	getProductsMeta() {
		return makeReportingRequest({
			method: 'GET',
			uri: commonConsts.ALL_PRODUCTS_META_API
		});
	},
	async getActiveProductsForAllSites() {
		const activeProducts = await getActiveProductFromCouchbase();
		return { data: activeProducts };
	},
	getActiveProducts(productNames, productsStatus) {
		if (!productsStatus) return 'N/A';

		const activeProducts = [];
		const productKeys = Object.keys(productsStatus);

		productKeys.forEach(productKey => {
			const product = productNames.find(product => product.id === productKey);
			const isProductActive = !!productsStatus[productKey];
			if (isProductActive && product) {
				activeProducts.push(product.value);
			}
		});

		return activeProducts;
	},
	getPublisherIdAndEmail(adNetworkSettings) {
		if (adNetworkSettings && adNetworkSettings.length) {
			const adsenseNetwork = adNetworkSettings.find(network => network.networkName === 'ADSENSE');
			if (adsenseNetwork) {
				return {
					publisherId: adsenseNetwork.pubId || '',
					publisherEmail: adsenseNetwork.adsenseEmail || ''
				};
			}
		}

		return { publisherId: '', publisherEmail: '' };
	},
	getAdManager(adNetworkSettings, adServerSettings) {
		const networkCode =
			adServerSettings && adServerSettings.dfp && adServerSettings.dfp.activeDFPNetwork;
		if (!networkCode) return 'N/A';

		const isAdpushupDfp = Number.parseInt(networkCode) === commonConsts.ADPUSHUP_NETWORK_ID;

		let networkName = '';

		if (!isAdpushupDfp && adNetworkSettings && adNetworkSettings.length) {
			const dfpNetwork = adNetworkSettings.find(network => network.networkName === 'DFP');

			if (dfpNetwork && dfpNetwork.dfpAccounts.length) {
				dfpAccount = dfpNetwork.dfpAccounts.find(dfpAccount => dfpAccount.code === networkCode);
				networkName = (dfpAccount && dfpAccount.name) || '';
			}
		}

		return `${isAdpushupDfp ? 'AdPushup' : networkName} (${networkCode})`;
	},
	getNetworkTree() {
		return couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkConfig))
			.then(doc => doc.value);
	},
	getFormatedDate(date) {
		return moment(date).format('Do MMM YYYY');
	},
	getAllSitesStatColumns(allProductNames = [], allBidderNames = []) {
		const DEFAULT_WIDTH = {
			width: 150,
			maxWidth: 150,
			minWidth: 150
		};

		return [
			{
				name: 'Site Id',
				key: 'siteId',
				position: 1,
				showCopyBtn: true,
				width: 100,
				maxWidth: 100,
				minWidth: 100
			},
			{
				name: 'Domain',
				key: 'domain',
				position: 2,
				showCopyBtn: true,
				width: 250,
				maxWidth: 250,
				minWidth: 250
			},
			{
				name: 'Owner Email',
				key: 'accountEmail',
				position: 3,
				showCopyBtn: true,
				width: 250,
				maxWidth: 250,
				minWidth: 250
			},
			{
				name: 'Account ID',
				key: 'sellerId',
				position: 4,
				showCopyBtn: true,
				width: 250,
				maxWidth: 250,
				minWidth: 250
			},
			{
				name: 'Onboarding Status',
				key: 'onboardingStatus',
				position: 5,
				width: 200,
				maxWidth: 200,
				minWidth: 200
			},
			{
				name: 'Active Status',
				key: 'activeStatus',
				position: 6,
				filters: ['Active', 'Inactive', 'N/A'],
				...DEFAULT_WIDTH
			},
			{ name: 'Date Created', key: 'dateCreated', position: 7, ...DEFAULT_WIDTH },
			{
				name: 'Active Products',
				key: 'activeProducts',
				position: 8,
				filters: [...allProductNames, 'N/A'],
				isMultiValue: true,
				showCopyBtn: true,
				width: 180,
				maxWidth: 180,
				minWidth: 180
			},
			{
				name: 'Active Bidders',
				key: 'activeBidders',
				position: 9,
				filters: [...allBidderNames, 'N/A'],
				isMultiValue: true,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{
				name: 'Inactive Bidders',
				key: 'inactiveBidders',
				position: 10,
				filters: [...allBidderNames, 'N/A'],
				isMultiValue: true,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{ name: 'Rev Share (%)', key: 'revenueShare', position: 11, ...DEFAULT_WIDTH },
			{
				name: 'Publisher Id',
				key: 'publisherId',
				position: 12,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{
				name: 'Auth Email',
				key: 'authEmail',
				position: 13,
				showCopyBtn: true,
				width: 200,
				maxWidth: 200,
				minWidth: 200
			},
			{
				name: 'Ad Manager',
				key: 'adManager',
				position: 14,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			}
		];
	},
	getInventories: siteId =>
		Promise.all([
			commonSiteFunctions.getLayoutInventories(siteId),
			commonSiteFunctions.getAdsInventories(siteId, 'tgmr'),
			commonSiteFunctions.getAdsInventories(siteId, 'fmrt'),
			commonSiteFunctions.getAdsInventories(siteId, 'ampd'),
			commonSiteFunctions.getApLiteInventories(siteId)
		]).then(
			([
				layoutInventories,
				apTagInventories = [],
				innovativeAdsInventories = [],
				ampAdsInventories = [],
				apLiteInventories = []
			]) => {
				const inventories = [
					...layoutInventories,
					...apTagInventories,
					...innovativeAdsInventories,
					...ampAdsInventories,
					...apLiteInventories
				];

				return inventories;
			}
		)
};

function apiModule() {
	const API = {
		getAllSitesStats() {
			const query = N1qlQuery.fromString(commonConsts.GET_ALL_SITES_STATS_QUERY);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(sites =>
					Promise.all([
						sites,
						commonSiteFunctions.getNetworkTree(),
						commonSiteFunctions.getProductsMeta(),
						commonSiteFunctions.getActiveProductsForAllSites()
					])
				)
				.then(([sites, networkTree, productsMeta, activeProductsForAllSites]) => {
					const finalSites = sites.map(site => {
						const { publisherId, publisherEmail } = commonSiteFunctions.getPublisherIdAndEmail(
							site.adNetworkSettings
						);
						if (!site.revenueShare && site.revenueShare !== 0) {
							site.revenueShare = 'N/A';
						}
						const {
							activeBidders,
							inactiveBidders
						} = commonSiteFunctions.getActiveInactiveBidderNames(site.addedBidders, networkTree);

						site.activeBidders = activeBidders;
						site.inactiveBidders = inactiveBidders;
						site.onboardingStatus = commonSiteFunctions.getOnboardingStatus(
							site.onboardingStep,
							site.apps
						);
						site.activeProducts = commonSiteFunctions.getActiveProducts(
							productsMeta.data.result,
							activeProductsForAllSites.data[site.siteId]
						);
						site.publisherId = publisherId;
						site.authEmail = publisherEmail;
						site.adManager = commonSiteFunctions.getAdManager(
							site.adNetworkSettings,
							site.adServerSettings
						);
						site.dateCreated = commonSiteFunctions.getFormatedDate(site.dateCreated);

						site.activeStatus =
							typeof site.activeStatus === 'boolean'
								? site.activeStatus
									? 'Active'
									: 'Inactive'
								: 'N/A';

						delete site.addedBidders;
						delete site.onboardingStep;
						delete site.apps;
						delete site.adNetworkSettings;
						delete site.adServerSettings;

						for (const key in site) {
							if (site.hasOwnProperty(key) && site[key] === '') {
								site[key] = 'N/A';
							}
						}

						return site;
					});

					const sortedFinalSites = finalSites.sort((a, b) => a.siteId - b.siteId);
					const allProductNames = productsMeta.data.result.map(product => product.value);
					const allBidderNames = Object.keys(networkTree).reduce((allBidderNames, networkKey) => {
						const network = networkTree[networkKey];
						if (commonSiteFunctions.isActiveHbBidder(network, networkKey)) {
							allBidderNames.push(network.name);
						}

						return allBidderNames;
					}, []);
					return {
						columns: commonSiteFunctions.getAllSitesStatColumns(allProductNames, allBidderNames),
						result: sortedFinalSites
					};
				})
				.catch(err => {
					console.log(err, 'ok');
					throw new AdPushupError('Something went wrong');
				});
		},
		sendNotification(notificationData) {
			const groupId = new Date().getTime();
			const postData = {
				queue: 'NOTIFICATIONS',
				data: []
			};
			const { emails, actionUrl, notificationText } = notificationData;

			postData.data = emails.map(email => ({
				email: email,
				message: notificationText,
				actionUrl: actionUrl,
				meta: {
					groupId: groupId,
					allUser: false
				}
			}));

			return request({
				method: 'POST',
				json: true,
				uri: config.RABBITMQ.PUBLISHER_API_BULK,
				body: postData
			});
		},
		getAllSiteMapping() {
			const query = N1qlQuery.fromString(
				'Select siteId, siteDomain from AppBucket where meta().id like "site::%"'
			);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(notifications => {
					return notifications;
				})
				.catch(err => {
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		},
		getAllNotifications() {
			const query = N1qlQuery.fromString(
				'Select message, actionUrl,id,dateCreated,userEmail,notificationMeta from apNotificationBucket;'
			);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(notifications => {
					return notifications;
				})
				.catch(err => {
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		},
		getSiteAllInventory: async siteId => {
			const inventories = await commonSiteFunctions.getInventories(siteId);
			if (!inventories.length) {
				return [];
			}
			return inventories;
		}
	};

	return API;
}
