module.exports = apiModule();

const { N1qlQuery } = require('couchbase');
const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');
const clonedeep = require('lodash.clonedeep');

const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const commonConsts = require('../configs/commonConsts');
const proxy = require('../helpers/proxy');

const commonSiteFunctions = {
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
		return request({
			method: 'GET',
			json: true,
			uri: commonConsts.ALL_PRODUCTS_META_API
		});
	},
	getActiveProductsForAllSites() {
		return request({
			method: 'GET',
			json: true,
			uri: commonConsts.ACTIVE_PRODUCTS_FOR_ALL_SITES_API
		});
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
				name: 'Onboarding Status',
				key: 'onboardingStatus',
				position: 4,
				width: 200,
				maxWidth: 200,
				minWidth: 200
			},
			{
				name: 'Active Status',
				key: 'activeStatus',
				position: 5,
				filters: ['Active', 'Inactive', 'N/A'],
				...DEFAULT_WIDTH
			},
			{ name: 'Date Created', key: 'dateCreated', position: 6, ...DEFAULT_WIDTH },
			{
				name: 'Active Products',
				key: 'activeProducts',
				position: 7,
				filters: allProductNames,
				isMultiValue: true,
				showCopyBtn: true,
				width: 180,
				maxWidth: 180,
				minWidth: 180
			},
			{
				name: 'Active Bidders',
				key: 'activeBidders',
				position: 8,
				filters: [...allBidderNames, 'N/A'],
				isMultiValue: true,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{
				name: 'Inactive Bidders',
				key: 'inactiveBidders',
				position: 9,
				filters: allBidderNames,
				isMultiValue: true,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{ name: 'Rev Share (%)', key: 'revenueShare', position: 10, ...DEFAULT_WIDTH },
			{
				name: 'Publisher Id',
				key: 'publisherId',
				position: 11,
				showCopyBtn: true,
				...DEFAULT_WIDTH
			},
			{
				name: 'Auth Email',
				key: 'authEmail',
				position: 12,
				showCopyBtn: true,
				width: 200,
				maxWidth: 200,
				minWidth: 200
			},
			{ name: 'Ad Manager', key: 'adManager', position: 13, showCopyBtn: true, ...DEFAULT_WIDTH }
		];
	}
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
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		},

		getActiveSites() {
			const query = N1qlQuery.fromString(commonConsts.GET_ACTIVE_SITES_QUERY);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(sites => {
					return sites.map(value => value);
				})
				.catch(err => console.log(err));
		},

		getAdsTxtEntries(siteId, adsTxtSnippet, currentSelectedEntry) {
			const adsTxt = proxy.fetchOurAdsTxt();

			function adsTxtProcessing(params) {
				const { domain, siteId, accountEmail, adsTxtSnippet, currentSelectedEntry } = params;
				let commonOutput = {
					domain,
					siteId,
					accountEmail
				};
				return adsTxt
					.then(ourAdsTxt =>
						proxy.verifyAdsTxt(domain, (ourAdsTxt = adsTxtSnippet ? adsTxtSnippet : ourAdsTxt))
					)
					.then(() => ({
						status: 1,
						message: 'All Entries Available',
						...commonOutput
					}))
					.catch(err => {
						if (err instanceof AdPushupError) {
							const {
								message: { httpCode = 404, ourAdsTxt, presentEntries }
							} = err;
							let output = null;

							switch (httpCode) {
								case 204:
									output = {
										status: 2,
										message: "Our Ads.txt entries not found in publisher's ads.txt",
										...commonOutput
									};
									break;
								case 206:
									if (currentSelectedEntry === 'Missing Entries')
										output = {
											status: 3,
											message: "Some entries not found in publisher's ads.txt",
											adsTxtEntries: ourAdsTxt,
											...commonOutput
										};
									else if (currentSelectedEntry === 'Present Entries')
										output = {
											status: 3,
											message: "Present entries found in publisher's ads.txt",
											adsTxtEntries: presentEntries,
											...commonOutput
										};
									else
										output = {
											status: 3,
											message: 'All Ads.txt Entries Not Present For this site',
											adsTxtEntries: ourAdsTxt,
											...commonOutput
										};

									break;
								default:
								case 404:
									output = {
										status: 4,
										message: "Publisher's ads.txt not found",
										...commonOutput
									};
									break;
							}

							return Promise.resolve(output);
						}
						return Promise.reject(err);
					});
			}

			return this.getActiveSites()
				.then(sites => {
					if (!siteId) {
						const sitesPromises = sites.map(value =>
							adsTxtProcessing({
								domain: value.domain,
								siteId: value.siteId,
								accountEmail: value.accountEmail,
								adsTxtSnippet,
								currentSelectedEntry
							})
						);
						return Promise.all(sitesPromises);
					}

					let enteredSiteEntries = sites.filter(site => site.siteId === parseInt(siteId));
					const { domain, accountEmail } = enteredSiteEntries[0];
					const params = {
						domain,
						siteId: parseInt(siteId),
						accountEmail,
						adsTxtSnippet,
						currentSelectedEntry
					};

					return adsTxtProcessing(params);
				})

				.catch(err => {
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		}
	};

	return API;
}
