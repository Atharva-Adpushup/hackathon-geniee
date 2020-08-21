const path = require('path');

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

		return prebidGeneration(prebidAdapters)
			.then(() => {
				return readTempFile(buildFileConfig);
			})
			.then(content => {
				buildFileConfig.content = content;
				delete buildFileConfig.path;

				return buildFileConfig;
			});
	}

	return getActiveUsedBidderAdapters()
		.then(activeBidders => {
			// Update activeBidders doc if activeBidders List has been changed
			return updateActiveBidderAdaptersIfChanged(activeBidders);
		})
		.then(data => {
			if (!data.isUpdated) {
				throw new Error('Active Bidder Adapters List not changed!');
			}

			console.log('Building separate prebid bundle...');
			return buildPrebidBundle(data.activeBidderAdapters);
		})
		.then(prebidBundle => {
			const fileConfig = {
				...prebidBundle,
				path: path.join(__dirname, '..', '..', '..', 'public', 'assets', 'js', 'builds', 'geniee')
			};

			return writeTempFiles([fileConfig]);
		})
		.then(([prebidBundle]) => {
			const fileConfig = { name: prebidBundle.name, default: prebidBundle.content };

			// push script to cdn
			return pushToCdnOriginQueue(fileConfig);
		})
		.catch(err => {
			console.log(err.message);
		});
};
