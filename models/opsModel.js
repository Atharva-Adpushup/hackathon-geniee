module.exports = apiModule();

const { N1qlQuery } = require('couchbase');
const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');

const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const commonConsts = require('../configs/commonConsts');

const commonSiteFunctions = {
	getActiveInactiveBidderNames(addedBidders = {}, networkTree = {}) {
		let activeBidders = '';
		let inactiveBidders = '';

		for (const key1 in networkTree) {
			const network = networkTree[key1];
			if (
				networkTree.hasOwnProperty(key1) &&
				network.isActive &&
				network.isHb &&
				key1 !== 'adpTags'
			) {
				const currentAddedBidder = addedBidders[key1];
				if (currentAddedBidder && currentAddedBidder.isActive && !currentAddedBidder.isPaused) {
					activeBidders += `${activeBidders ? ', ' : ''}${currentAddedBidder.name}`;
				} else {
					inactiveBidders += `${inactiveBidders ? ', ' : ''}${network.name}`;
				}
			}
		}

		return { activeBidders, inactiveBidders };
	},
	getOnboardingStatus(onboardingStep, apps = {}) {
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
		}
	},
	getSitesReport() {
		const dateFormat = 'YYYY-MM-DD';
		const days = 2;
		const dayOffset = 1;

		return request({
			method: 'GET',
			json: true,
			uri: commonConsts.GET_SITES_STATS,
			qs: {
				report_name: 'get_stats_by_custom',
				isSuperUser: true,
				dimension: 'siteid,mode',
				fromDate: moment()
					.subtract(days + dayOffset, 'days')
					.format(dateFormat),
				toDate: moment()
					.subtract(dayOffset, 'days')
					.format(dateFormat)
			}
		});
	},
	getActiveProducts(apps) {
		const appKeys = Object.keys(apps);

		return appKeys.reduce((activeProducts, appKey) => {
			const currentProduct = apps[appKey]
				? `${activeProducts ? ', ' : ''}${commonConsts.APP_KEY_NAME_MAPPING[appKey]}`
				: '';
			return activeProducts + currentProduct;
		}, '');
	},
	getPublisherIdAndEmail(adNetworkSettings) {
		if (adNetworkSettings && adNetworkSettings.length) {
			const adsenseNetwork = adNetworkSettings.find(network => network.networkName === 'ADSENSE');
			if (adsenseNetwork) {
				return { publisherId: adsenseNetwork.pubId, publisherEmail: adsenseNetwork.adsenseEmail };
			}
		}

		return { publisherId: '', publisherEmail: '' };
	},
	getAdManager(adNetworkSettings) {
		if (adNetworkSettings && adNetworkSettings.length) {
			const dfpNetwork = adNetworkSettings.find(network => network.networkName === 'DFP');
			if (dfpNetwork && dfpNetwork.dfpAccounts.length) {
				return `${
					dfpNetwork.dfpAccounts[0].code === commonConsts.ADPUSHUP_NETWORK_ID
						? 'AdPushup'
						: 'Publisher'
				} (${dfpNetwork.dfpAccounts[0].code})`;
			}
		}

		return '';
	},
	getNetworkTree() {
		return couchbase
			.connectToAppBucket()
			.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkConfig))
			.then(doc => doc.value);
	},
	getFormatedDate(date) {
		return moment(date).format('Do MMM YYYY');
	}
};

function getUniqueSites(myArr, prop) {
	return _.uniq(_.map(myArr, prop));
}

function apiModule() {
	const API = {
		getAllSitesStats() {
			const query = N1qlQuery.fromString(commonConsts.GET_ALL_SITES_STATS_QUERY);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(sites => {
					return Promise.all([
						sites,
						commonSiteFunctions.getNetworkTree(),
						commonSiteFunctions.getSitesReport()
					]);
				})
				.then(([sites, networkTree, sitesReport]) => {
					const finalSites = sites.map(site => {
						const { publisherId, publisherEmail } = commonSiteFunctions.getPublisherIdAndEmail(
							site.adNetworkSettings
						);
						const {
							activeBidders,
							inactiveBidders
						} = commonSiteFunctions.getActiveInactiveBidderNames(site.addedBidders, networkTree);
						const uniqueSiteIds = getUniqueSites(sitesReport.data.result, 'siteid');

						site.activeBidders = activeBidders;
						site.inactiveBidders = inactiveBidders;
						site.onboardingStatus = commonSiteFunctions.getOnboardingStatus(
							site.onboardingStep,
							site.apps
						);
						site.activeProducts = commonSiteFunctions.getActiveProducts(site.apps);
						site.publisherId = publisherId;
						site.authEmail = publisherEmail;
						site.adManager = commonSiteFunctions.getAdManager(site.adNetworkSettings);
						site.dateCreated = commonSiteFunctions.getFormatedDate(site.dateCreated);

						site.activeStatus =
							sitesReport.code === 1 &&
							uniqueSiteIds &&
							!!uniqueSiteIds.find(currSiteId => currSiteId === site.siteId)
								? 'Active'
								: 'Inactive';

						delete site.addedBidders;
						delete site.onboardingStep;
						delete site.apps;
						delete site.adNetworkSettings;

						for (const key in site) {
							if (site.hasOwnProperty(key) && site[key] === '') {
								site[key] = 'N/A';
							}
						}

						return site;
					});

					return finalSites;
				})
				.catch(err => {
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		}
	};

	return API;
}
