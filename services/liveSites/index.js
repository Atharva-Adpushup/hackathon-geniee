const syncGeneratedFileWithCdn = require('../genieeAdSyncService/service'),
	utils = require('../../helpers/utils'),
	moment = require('moment'),
	{ fileLogger } = require('../../helpers/logger/file/index'),
	getAllLiveSites = require('./service');

module.exports = {
	init: () => {
		const getSites = getAllLiveSites.init(),
			uploadSites = getSites.then(function(sitesArr) {
				return utils.syncArrayPromise(sitesArr, syncGeneratedFileWithCdn.init);
			});

		return uploadSites
			.then(() => {
				const dateTime = moment().format('LLL'),
					successInfo = `All live Sites were synced at ${dateTime}`;

				fileLogger.info(successInfo);
				console.log(successInfo);
			})
			.catch(function(e) {
				const dateTime = moment().format('LLL'),
					errorInfo = `Sync process failed: ${e.toString()} at ${dateTime}`;

				fileLogger.info(errorInfo);
				fileLogger.err(e);
				console.log(errorInfo);
			});
		
	}
}