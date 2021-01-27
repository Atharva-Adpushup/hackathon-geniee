const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const couchbaseModule = require('couchbase');

const couchbase = require('../../../helpers/couchBaseService');
const commonConsts = require('../../../configs/commonConsts');
const config = require('../../../configs/config');
const helperUtils = require('../../../helpers/utils');

const N1qlQuery = couchbaseModule.N1qlQuery;
const isNotProduction =
	config.environment.HOST_ENV === 'development' || config.environment.HOST_ENV === 'staging';

function getBiddersFromNetworkTree() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.networkConfig, {}))
		.then(({ value: networkTree }) => {
			const biddersFromNetworkTree = {};

			for (const bidderCode in networkTree) {
				if (networkTree.hasOwnProperty(bidderCode) && networkTree[bidderCode].isHb) {
					biddersFromNetworkTree[bidderCode] = networkTree[bidderCode];
				}
			}

			return biddersFromNetworkTree;
		})
		.catch(err => Promise.resolve({}));
}

function getSizeMappingConfigFromCB() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(commonConsts.docKeys.sizeMapppingConfig, {}))
		.then(({ value }) => value || {})
		.catch(err => Promise.resolve({}));
}

function getActiveUsedBidderAdapters() {
	return getDataByN1qlQuery(commonConsts.PREBID_BUNDLING.ACTIVE_BIDDER_ADAPTERS_N1QL);
}

function getActiveUsedBidderAdaptersBySite(siteId) {
	return getDataByN1qlQuery(
		commonConsts.PREBID_BUNDLING.ACTIVE_BIDDER_ADAPTERS_BY_SITE_N1QL.replace('__SITE_ID__', siteId)
	);
}

function isS2SBidderAddedOnAnySite() {
	return getDataByN1qlQuery(commonConsts.PREBID_BUNDLING.FIRST_S2S_BIDDER_SITE).then(
		sites => Array.isArray(sites) && !!sites.length
	);
}

function isS2SBidderAddedOnGivenSite(siteId) {
	return getDataByN1qlQuery(
		commonConsts.PREBID_BUNDLING.S2S_BIDDER_BY_SITE.replace('__SITE_ID__', siteId)
	).then(sites => Array.isArray(sites) && !!sites.length);
}

function getDataByN1qlQuery(queryString) {
	const query = N1qlQuery.fromString(queryString);

	return couchbase.connectToAppBucket().then(appBucket => {
		return appBucket.queryAsync(query);
	});
}

function writeTempFiles(fileConfigs) {
	const fsWriteFilePromises = fileConfigs.map(file => {
		return mkdirpAsync(file.path).then(function() {
			return fs.writeFileAsync(path.join(file.path, file.name), file.content);
		});
	});

	return Promise.join(fsWriteFilePromises, () => {
		return fileConfigs;
	});
}

function readTempFile(fileConfig) {
	return fs.readFileAsync(path.join(fileConfig.path, fileConfig.name), 'utf-8');
}

function pushToCdnOriginQueue(fileConfig, siteId) {
	if (isNotProduction) {
		console.log(`Environment is development/staging. Skipping CDN syncing for ${fileConfig.name}.`);
		return Promise.resolve(fileConfig);
	} else {
		const job = { content: Buffer.from(fileConfig.default).toString('base64') };

		if (fileConfig.name === 'adpushup.js') {
			job.filePath = `${siteId}/${fileConfig.name}`;
		}

		if (fileConfig.name.match(/^pb.\d+.js$/)) {
			job.filePath = `prebid/${fileConfig.name}`;
		}

		console.log(`${fileConfig.name} pushed to cdn origin queue at ${job.filePath} path.`);

		return helperUtils.publishToRabbitMqQueue(
			config.RABBITMQ.CDN_ORIGIN.NAME_IN_QUEUE_PUBLISHER_SERVICE,
			job
		);
	}
}

module.exports = {
	getBiddersFromNetworkTree,
	getSizeMappingConfigFromCB,
	getActiveUsedBidderAdapters,
	getActiveUsedBidderAdaptersBySite,
	isS2SBidderAddedOnAnySite,
	isS2SBidderAddedOnGivenSite,
	writeTempFiles,
	readTempFile,
	pushToCdnOriginQueue
};
