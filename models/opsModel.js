module.exports = apiModule();

const { N1qlQuery } = require('couchbase');
const request = require('request-promise');
const moment = require('moment');

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
	getSitesStatus(siteIds) {
		return request({
			method: 'GET',
			json: true,
			uri: commonConsts.ACTIVE_SITES_API,
			qs: {
				fromDate: moment()
					.subtract(3, 'days')
					.format('YYYY-MM-DD'),
				toDate: moment()
					.subtract(1, 'days')
					.format('YYYY-MM-DD'),
				minPageViews: 10000,
				siteid: siteIds.join(',')
			}
		});
	},
	getActiveProducts(apps) {
		const appKeys = Object.keys(apps);

		return appKeys.reduce(
			(activeProducts, appKey) =>
				apps[appKey]
					? `${activeProducts ? ', ' : ''}${commonConsts.APP_KEY_NAME_MAPPING[appKey]}`
					: '',
			''
		);
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
	}
};

function apiModule() {
	const API = {
		getAllSitesData() {
			const query = N1qlQuery.fromString(
				`SELECT _site.siteId,
					_site.siteDomain as domain,
					_site.ownerEmail as accountEmail,
					_site.adNetworkSettings.revenueShare,
					_site.step as onboardingStep,
					_site.dateCreated,
					_site.apps,
					_user.adNetworkSettings,
					_hbcf.hbcf as addedBidders
				FROM AppBucket _site
				LEFT JOIN AppBucket _user
				ON keys ('user::' || _site.ownerEmail)
				LEFT JOIN AppBucket _hbcf
				ON keys ('hbcf::' || to_string(_site.siteId))
				WHERE meta(_site).id LIKE 'site::%'
				AND meta(_user).id LIKE 'user::%';`
			);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.queryAsync(query))
				.then(sites => {
					const siteIds = sites.map(site => site.siteId);

					return Promise.all([
						sites,
						commonSiteFunctions.getNetworkTree().catch(err => null),
						commonSiteFunctions.getSitesStatus(siteIds)
					]);
				})
				.then(([sites, networkTree, sitesStatus]) => {
					const finalSites = sites.map(site => {
						const { publisherId, publisherEmail } = commonSiteFunctions.getPublisherIdAndEmail(
							site.adNetworkSettings
						);
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
						site.activeProducts = commonSiteFunctions.getActiveProducts(site.apps);
						site.publisherId = publisherId;
						site.authEmail = publisherEmail;
						site.adManager = commonSiteFunctions.getAdManager(site.adNetworkSettings);

						// site.activeStatus = sitesStatus.code === 1 && sitesStatus.data.result.length

						delete site.addedBidders;
						delete site.onboardingStep;
						delete site.apps;
						delete site.adNetworkSettings;

						return site;
					});

					console.log(finalSites);
				})
				.catch(err => {
					console.log(err);
				});
		}
	};

	return API;
}
