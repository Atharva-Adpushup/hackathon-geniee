// const schedule = require('node-schedule');

const CC = require('../../configs/commonConsts');
const criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const IndexExchange = require('../partnersPanelAnomaliesDetectionService/IndexExchange');
const Sovrn = require('../partnersPanelAnomaliesDetectionService/Sovrn');
const { appBucket } = require('../../helpers/routeHelpers');

const PARTNERS_LIST = {
	"Criteo": criteo,
	"Pubmatic": Pubmatic,
	"OFT": OFT,
	"IndexExchange": IndexExchange
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

function startPartnersPanelsAnomaliesDetectionService(partner, retryCount = 0 ) {
	getSitesFromDB()
		.then(sitesData => {
			if(partner) {
				return partner(sitesData)
					.catch(err => {
						throw { err };
					});
			} else {
					throw { err: new Error('Partner not found!') };
			}
		})
		.then(result => {
			if (!result.status) {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`);
				const perc = (result.anomalies * 100) / (result.total);
				console.log(
					`${result.partner}\t${result.total}\t${result.anomalies}\t${perc.toFixed(2)}%\t${
						result.message
					}`
				);
				process.exit(0);
			} else {
				if(retryCount < 10) {
					retryCount++;
					const time = 1000 * 60 * 5 * retryCount;
					console.log(`Retry attempt - ${retryCount} in ${5 * retryCount} min(s)`)
					setTimeout(async () => {
						await startPartnersPanelsAnomaliesDetectionService(partner, retryCount)
					}, time);
				} else {
					process.exit(0);
				}
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			// await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

if (process.env.PARTNER_NAME) {
	const { PARTNER_NAME } = process.env;
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST[PARTNER_NAME])
} else {
	console.log('No partner name passed!')
}
