const criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const { appBucket } = require('../../helpers/routeHelpers');

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
            // `select distinct siteId, siteDomain from AppBucket where meta().id like "site::%";`
            // `SELECT distinct siteId,siteDomain from ${config.couchBase.DEFAULT_BUCKET} where substr(meta().id,0,6)='site::'`
		)
		.catch(e => {
			console.log(`error in getting site Lists:${e}`);
			throw { error: true };
			// return err;
		});
	return siteListPromise;
}

getSitesFromDB().then((sitesData) => {
    return Promise.all([criteo(sitesData)])
})
.then(result => {
    if(result instanceof Error) {
        console.error(result);
        process.exit(1);
    } else {
        process.exit(0);
    }
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
