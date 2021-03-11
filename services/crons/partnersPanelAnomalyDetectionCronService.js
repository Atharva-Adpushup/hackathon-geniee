var cron = require('node-cron');

const CC = require('../../configs/commonConsts');
const criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const IndexExchange = require('../partnersPanelAnomaliesDetectionService/IndexExchange');
const Sovrn = require('../partnersPanelAnomaliesDetectionService/Sovrn');
const { appBucket } = require('../../helpers/routeHelpers');

const { couchbaseErrorHandler, sendErrorNotification } = require('../partnersPanelAnomaliesDetectionService/utils');

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

function startParntersPanelsAnomaliesDetectionService() {
	getSitesFromDB()
		.then(sitesData => {
			return Promise.all([
				criteo(sitesData),
				// OFT(sitesData),
				// Pubmatic(sitesData),
				// IndexExchange(sitesData),
				// Sovrn(sitesData)
			])
			.catch(err => {
				throw { err }
			});
		})
		.then(result => {
			if (result instanceof Error) {
				console.error(result);
				process.exit(1);
			} else {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`)
				result.forEach(item => {
					const perc = (item.anomalies*100)/(item.anomalies + item.total);
					console.log(`${item.partner}\t${item.total}\t${item.anomalies}\t${perc.toFixed(2)}%\t${item.message}`)
				});
				process.exit(0);
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			await sendErrorNotification(err, 'Patners Panel Service Crashed')
			process.exit(1);
		});
}

startParntersPanelsAnomaliesDetectionService()
// const JOB_NAME = 'AnomaliesDetection';
// cron.schedule(JOB_NAME, CC.cronSchedule.partnerPanelAnomaliesDetectionService, startParntersPanelsAnomaliesDetectionService);
