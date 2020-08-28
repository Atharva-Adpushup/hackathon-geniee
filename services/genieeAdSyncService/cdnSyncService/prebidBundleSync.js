const path = require('path');
const Promise = require('bluebird');

const commonConsts = require('../../../configs/commonConsts');
const {
	getActiveUsedBidderAdapters,
	writeTempFiles,
	readTempFile,
	pushToCdnOriginQueue
} = require('./commonFunctions');
const {
	updateActiveBidderAdaptersIfChanged
} = require('../../../models/activeBidderAdaptersListModel');
const prebidGeneration = require('./prebidGeneration');

module.exports = function() {
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

	return getActiveUsedBidderAdapters()
		.then(activeBidders => {
			// Update activeBidders doc if activeBidders List has been changed
			return updateActiveBidderAdaptersIfChanged(activeBidders);
		})
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
			return pushToCdnOriginQueue(fileConfig);
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
