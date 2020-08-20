const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const couchbaseModule = require('couchbase');

const couchbase = require('../../../helpers/couchBaseService');
const commonConsts = require('../../../configs/commonConsts');
const config = require('../../../configs/config');

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
		switch (fileConfig.name) {
			case 'adpushup.js':
				job.filePath = `${siteId}/${fileConfig.name}`;
				break;
			case 'prebid.js':
				job.filePath = fileConfig.name;
		}

		console.log(job);

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
	writeTempFiles,
	readTempFile,
	pushToCdnOriginQueue
};
