const CC = require('../../configs/commonConsts');
const Criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const IndexExchange = require('../partnersPanelAnomaliesDetectionService/IndexExchange');
// temp commented - partial integration
// const Sovrn = require('../partnersPanelAnomaliesDetectionService/Sovrn');
const OpenX = require('../partnersPanelAnomaliesDetectionService/OpenX');
const { appBucket } = require('../../helpers/routeHelpers');

const PARTNERS_LIST = {
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

function startPartnersPanelsAnomaliesDetectionService(partner, retryCount = 0) {
	Promise.resolve([])
		.then(sitesData => {
			if (partner) {
				return partner(sitesData).catch(err => {
					throw { err };
				});
			} else {
				throw new Error(`Partner not found! - ${process.env.PARTNER_NAME}. Time: ${new Date()}`);
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
						`Retry attempt for ${process.env.PARTNER_NAME} - ${retryCount}/10 in ${5 *
							retryCount} min(s). Time: ${new Date()}`
					);
					setTimeout(async () => {
						await startPartnersPanelsAnomaliesDetectionService(partner, retryCount);
					}, time);
				} else {
					process.exit(0);
				}
			}
		})
		.catch(async err => {
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

if (process.env.PARTNER_NAME) {
	const { PARTNER_NAME } = process.env;
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST[PARTNER_NAME]);
} else {
	console.log('No partner name passed!');
	process.exit(0);
}
