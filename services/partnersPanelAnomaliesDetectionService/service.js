// const schedule = require('node-schedule');

const CC = require('../../configs/commonConsts');
const criteo = require('./Criteo');
const OFT = require('./OFT');
const Pubmatic = require('./Pubmatic');
const IndexExchange = require('./IndexExchange');
const Sovrn = require('./Sovrn');
const { appBucket } = require('../../helpers/routeHelpers');

const {
	couchbaseErrorHandler,
	sendErrorNotification
} = require('../partnersPanelAnomaliesDetectionService/utils');

const PARTNERS_LIST = {
	"Criteo": criteo,
	"Pubmatic": Pubmatic,
	"OFT": OFT,
	"IndexExchange": IndexExchange
};

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

const executeAnomaliesDetectionForAllInParallel = () => {
	getSitesFromDB()
		.then(sitesData => {
			if(partner) {
				return Promise.all([partner(sitesData)])
					.catch(err => {
						throw { err };
					});
			} else {
				return Promise.all([
					criteo(sitesData),
					OFT(sitesData),
					Pubmatic(sitesData),
					IndexExchange(sitesData),
					// // Sovrn(sitesData)
				]).catch(err => {
					throw { err };
				});
			}
		})
		.then(result => {
			if (result instanceof Error) {
				console.error(result);
				process.exit(1);
			} else {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`);
				result.forEach(item => {
					const perc = (item.anomalies * 100) / (item.anomalies + item.total);
					console.log(
						`${item.partner}\t${item.total}\t${item.anomalies}\t${perc.toFixed(2)}%\t${
							item.message
						}`
					);
				});
				process.exit(0);
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

const executeAnomaliesDetectionForAllInSeries = (partner) => {
	getSitesFromDB()
		.then(sitesData => {
			return Promise.resolveInSeries([
				// criteo,
				OFT,
				// Pubmatic
			]).catch(err => {
				throw { err };
			})
		})
		.then(result => {
			if (result instanceof Error) {
				console.error(result);
				process.exit(1);
			} else {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`);
				result.forEach(item => {
					const perc = (item.anomalies * 100) / (item.anomalies + item.total);
					console.log(
						`${item.partner}\t${item.total}\t${item.anomalies}\t${perc.toFixed(2)}%\t${
							item.message
						}`
					);
				});
				process.exit(0);
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

const executeAnomaliesDetectionForIndividualPartner = (partner) => {
	getSitesFromDB()
		.then(sitesData => {
			if(partner) {
				return Promise.all([partner(sitesData)])
					.catch(err => {
						throw { err };
					});
			} else {
				return Promise.resolve([])
			}
		})
		.then(result => {
			if (result instanceof Error) {
				console.error(result);
				process.exit(1);
			} else {
				// Print Final Result
				console.log(`Name\tTotal\tAnomalies\tAnomaly %\tMessage`);
				result.forEach(item => {
					const perc = (item.anomalies * 100) / (item.anomalies + item.total);
					console.log(
						`${item.partner}\t${item.total}\t${item.anomalies}\t${perc.toFixed(2)}%\t${
							item.message
						}`
					);
				});
				process.exit(0);
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

module.exports = {
	executeAnomaliesDetectionForAllInParallel,
	executeAnomaliesDetectionForAllInSeries,
	executeAnomaliesDetectionForIndividualPartner,
}