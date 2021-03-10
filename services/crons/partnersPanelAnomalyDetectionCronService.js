var cron = require('node-cron');

const CC = require('../../configs/commonConsts');
const criteo = require('../partnersPanelAnomaliesDetectionService/Criteo');
const OFT = require('../partnersPanelAnomaliesDetectionService/OFT');
const Pubmatic = require('../partnersPanelAnomaliesDetectionService/Pubmatic');
const IndexExchange = require('../partnersPanelAnomaliesDetectionService/IndexExchange');
const Sovrn = require('../partnersPanelAnomaliesDetectionService/Sovrn');
const { appBucket } = require('../../helpers/routeHelpers');
// const constants = require('../../configs/commonConsts');
const emailer = require('../partnersPanelAnomaliesDetectionService/emailer');

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

function startParntersPanelsAnomaliesDetectionService() {
	getSitesFromDB()
		.then(sitesData => {
			return Promise.all([
				criteo(sitesData),
				OFT(sitesData),
				Pubmatic(sitesData),
				IndexExchange(sitesData),
				// Sovrn(sitesData)
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
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %`)
				result.forEach(item => {
					const perc = (item.anomalies*100)/(item.anomalies + item.total);
					console.log(`${item.partner}\t${item.total}\t${item.anomalies}\t${perc.toFixed(2)}%`)
				});
				process.exit(0);
			}
		})
		.catch(async err => {
			console.error(err);
			await emailer.serviceErrorNotificationMailService({
				partner: 'Main Service',
				error:err
			})

			process.exit(1);
		});
}

startParntersPanelsAnomaliesDetectionService();
// const JOB_NAME = 'AnomaliesDetection';
// cron.schedule(JOB_NAME, CC.cronSchedule.partnerPanelAnomaliesDetectionService, startParntersPanelsAnomaliesDetectionService);
