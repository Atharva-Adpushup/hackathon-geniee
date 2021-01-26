const path = require('path');
const Promise = require('bluebird');

const commonConsts = require('../../../configs/commonConsts');
const {
	getActiveUsedBidderAdapters,
	getActiveUsedBidderAdaptersBySite,
	isS2SBidderAddedOnAnySite,
	isS2SBidderAddedOnGivenSite,
	writeTempFiles,
	readTempFile,
	pushToCdnOriginQueue
} = require('./commonFunctions');
const {
	updateActiveBidderAdaptersIfChanged
} = require('../../../models/activeBidderAdaptersListModel');
const prebidGeneration = require('./prebidGeneration');

module.exports = function(siteSpecificPrebidSiteId) {
	function buildPrebidBundle(activeBidderAdapters) {
		const prebidAdapters = [
			...activeBidderAdapters,
			...commonConsts.PREBID_BUNDLING.PREBID_ADAPTERS_TO_ALWAYS_BUILD
		].join(',');

		const buildFileConfig = {
			path: path.join(
				__dirname,
				'../',
				'adpushup.js',
				'modules',
				'adpTags',
				'Prebid.js',
				'build',
				'dist'
			),
			name: 'prebid.js'
		};

		return prebidGeneration(prebidAdapters).then(() => readTempFile(buildFileConfig));
	}

	function getActiveBiddersForAllSites() {
		return Promise.join(getActiveUsedBidderAdapters(), isS2SBidderAddedOnAnySite()).then(
			([activeBidders, s2sBidderAddedOnAnySite]) => {
				if (s2sBidderAddedOnAnySite) activeBidders.push(commonConsts.PREBID_ADAPTERS.prebidServer);

				// Update activeBidders doc if activeBidders List has been changed
				return updateActiveBidderAdaptersIfChanged(activeBidders);
			}
		);
	}

	function getActiveBiddersBySite(siteId) {
		return Promise.join(
			getActiveUsedBidderAdaptersBySite(siteId),
			isS2SBidderAddedOnGivenSite(siteId)
		).then(([activeBidders, s2sBidderAddedOnAnySite]) => {
			if (s2sBidderAddedOnAnySite) activeBidders.push(commonConsts.PREBID_ADAPTERS.prebidServer);

			const output = {
				activeBidderAdapters: activeBidders,
				prebidBundleName: `pb.${siteId}.js`,
				isUpdated: true
			};
			return output;
		});
	}

	function getActiveBidders() {
		if (siteSpecificPrebidSiteId) {
			return getActiveBiddersBySite(siteSpecificPrebidSiteId);
		}

		return getActiveBiddersForAllSites();
	}

	return getActiveBidders()
		.then(data => {
			if (!data.prebidBundleName) {
				throw new Error('Something went wrong, Prebid bundle name not found.');
			}

			if (!data.isUpdated) {
				throw {
					error: 'Active Bidder Adapters List not changed!',
					customData: { name: data.prebidBundleName }
				};
			}

			console.log('Building separate prebid bundle...');
			return Promise.join(buildPrebidBundle(data.activeBidderAdapters), data.prebidBundleName);
		})
		.then(([prebidBundleContent, prebidBundleName]) => {
			const fileConfig = {
				content: prebidBundleContent,
				path: path.join(
					__dirname,
					'..',
					'..',
					'..',
					'public',
					'assets',
					'js',
					'builds',
					'geniee',
					'prebid'
				),
				name: prebidBundleName
			};

			return writeTempFiles([fileConfig]);
		})
		.then(([prebidBundle]) => {
			const fileConfig = { name: prebidBundle.name, default: prebidBundle.content };

			// push script to cdn
			return pushToCdnOriginQueue(fileConfig).then(() => fileConfig);
		})
		.catch(err => {
			if (err.customData) {
				console.log(err.error);
				return err.customData;
			}

			console.log('Some error in prebid bundle sync service!');
			console.log(err.message);
			throw err;
		});
};
