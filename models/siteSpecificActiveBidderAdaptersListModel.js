module.exports = apiModule();

// const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
// const { docKeys } = require('../configs/commonConsts');
const commonConsts = require('../configs/commonConsts');
const N1qlQuery = require('couchbase').N1qlQuery;
const HeaderBiddingModel = require('./headerBiddingModel');
const SiteModel = require('./siteModel');

function apiModule() {
	const API = {
		getActiveAndUsedBidderAdapters: function(siteId) {
			const queryString = commonConsts.PREBID_BUNDLING.SITE_SPECIFIC_ACTIVE_BIDDER_ADAPTERS_N1QL.replace(
				'__SITES_QUERY__',
				`[${siteId}]`
			);
			const query = N1qlQuery.fromString(queryString);

			return couchbase.connectToAppBucket().then(appBucket => {
				return appBucket.queryAsync(query);
			});
		},
		updateActiveBidderAdaptersIfChanged(activeBidderAdapters, siteId) {
			const newActiveBiddersInAscOrder = activeBidderAdapters.sort();
			const output = {
				activeBidderAdapters: newActiveBiddersInAscOrder,
				isUpdated: false,
				prebidBundleName: ''
			};

			const newActiveBiddersInAscOrderString = newActiveBiddersInAscOrder.join(',');

			return SiteModel.getSiteById(siteId)
				.then(site => {
					const activeBidderAdaptersList = site.getActiveBidderAdaptersList();

					if (activeBidderAdaptersList == newActiveBiddersInAscOrderString) {
						return site;
					}

					return site.setActiveBidderAdaptersList(newActiveBiddersInAscOrderString).then(site => {
						output.isUpdated = true;
						return site;
					});
				})
				.then(site => {
					output.prebidBundleName = site.get('prebidBundleName');
					return output;
				});
		},
		isS2SActiveOnAnySite: function(siteId) {
			const queryString = commonConsts.PREBID_BUNDLING.SITE_SPECIFIC_FIRST_S2S_BIDDER_SITE.replace(
				'__SITES_QUERY__',
				`[${siteId}]`
			);
			const query = N1qlQuery.fromString(queryString);

			return couchbase
				.connectToAppBucket()
				.then(appBucket => {
					return appBucket.queryAsync(query);
				})
				.then(sites => {
					return Array.isArray(sites) && !!sites.length;
				});
		}
	};

	return API;
}
