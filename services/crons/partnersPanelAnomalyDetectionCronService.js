const CC = require('../../configs/commonConsts');
const Criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const IndexExchange = require('../partnersPanelAnomaliesDetectionService/IndexExchange');
// temp commented - partial integration
// const Sovrn = require('../partnersPanelAnomaliesDetectionService/Sovrn');
const OpenX = require('../partnersPanelAnomaliesDetectionService/OpenX');
const { appBucket } = require('../../helpers/routeHelpers');

const PARTNERS_MODULE_LIST = {
	Criteo: Criteo,
	Pubmatic: Pubmatic,
	OFT: OFT,
	IndexExchange: IndexExchange,
	// temp commented - partial integration
	// "Sovrn": Sovrn,
	OpenX: OpenX
};

const {
	couchbaseErrorHandler,
	sendErrorNotification
} = require('../partnersPanelAnomaliesDetectionService/utils');

const getSitesFromDB = async () => {
	const siteListPromise = await appBucket
		.queryDB(
			`
            SELECT DISTINCT siteId, siteDomain
                FROM AppBucket
                WHERE META().id LIKE "site::%"
                    AND dataFeedActive = TRUE;
            `
		)
		.catch(couchbaseErrorHandler);
	return siteListPromise;
};

function startPartnersPanelsAnomaliesDetectionService(partnerName, retryCount = 0) {
	const partner = PARTNERS_MODULE_LIST[partnerName];
	getSitesFromDB()
		.then(sitesData => {
			if (partner) {
				return partner(sitesData).catch(err => {
					throw { err };
				});
			} else {
				throw new Error(`Partner not found! - ${partnerName}. Time: ${new Date()}`);
			}
		})
		.then(result => {
			if (result && !result.status) {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`);
				const perc = (result.anomalies * 100) / result.total;
				console.log(
					`${result.partner}\t${result.total}\t${result.anomalies}\t${perc.toFixed(2)}%\t${
						result.message
					}`
				);
				process.exit(0);
			} else {
				if (retryCount < 10) {
					retryCount++;
					const time = 1000 * 60 * 1 * retryCount;
					console.log(
						`Retry attempt for ${partnerName} - ${retryCount}/10 in ${5 *
							retryCount} min(s). Time: ${new Date()}`
					);
					setTimeout(async () => {
						await startPartnersPanelsAnomaliesDetectionService(partnerName, retryCount);
					}, time);
				}
			}
		})
		.catch(async err => {
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
		});
}

module.exports = {
	startPartnersPanelsAnomaliesDetectionService
}