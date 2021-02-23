const criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const { appBucket } = require('../../helpers/routeHelpers');
const constants = require('../../configs/commonConsts');

function getSitesFromDB() {
	// select distinct siteId, siteDomain from AppBucket where meta().id like "site::%";

	const siteListPromise = appBucket
		.queryDB(
			`
            SELECT DISTINCT siteId, siteDomain
                FROM AppBucket
                WHERE META().id LIKE "site::%"
                    AND dataFeedActive = TRUE;
            `
		)
		.catch(e => {
			console.log(`error in getting site Lists:${e}`);
			throw { error: true };
			// return err;
		});
	return siteListPromise;
}

getSitesFromDB()
	.then(sitesData => {
		return Promise.all([
			// criteo(sitesData)
			// OFT(sitesData)
			Pubmatic(sitesData)
		])
		.catch(err => {
			console.log(err, 'err in service');
		});
	})
	.then(result => {
		if (result instanceof Error) {
			console.error(result);
			process.exit(1);
		} else {
			console.log(result, 'result in main index.js');
			process.exit(0);
		}
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
