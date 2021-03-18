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

function startPartnersPanelsAnomaliesDetectionService(partner, isAlreadyErrored = false) {
	getSitesFromDB()
		.then(sitesData => {
			if(partner) {
				return Promise.all([partner(sitesData)])
					.catch(err => {
						throw { err };
					});
			} else {
				return Promise.resolveInSeries([
					// criteo,
					OFT,
					// Pubmatic
				]).catch(err => {
					throw { err };
				})
				// return Promise.all([
				// 	// criteo(sitesData)
				// 	OFT(sitesData),
				// 	// Pubmatic(sitesData),
				// 	// IndexExchange(sitesData),
				// 	// // Sovrn(sitesData)
				// ]).catch(err => {
				// 	throw { err };
				// });
			}
		})
		.then(result => {
			console.log(result, 'result')
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
				const errList = result.filter(item => item.status === 'Error')
				if(errList.length) {
					errList.forEach(item => {
						setTimeout(async () => {
							console.log(PARTNERS_LIST[item.partner], 'PARTNERS_LIST[item.partner]')
							// to prevent unwanted restarts - multiple failed attempts
							// Only one restart
							if(!isAlreadyErrored) {
								await startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST[item.partner], true)
							}
						}, 5000);
					})
				} else {
					process.exit(0);
				}
			}
		})
		.catch(async err => {
			console.error(err, 'Main catch');
			await sendErrorNotification(err, 'Patners Panel Service Crashed');
			process.exit(1);
		});
}

if (process.env.PARTNER_NAME) {
	const { PARTNER_NAME } = process.env;
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST[PARTNER_NAME])
} else {
	// execute all
	startPartnersPanelsAnomaliesDetectionService();
}



Promise.resolveInSeries = function(queue, sitesData) {
    // function methodThatReturnsAPromise(id) {
    //     return new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             console.log(`Processing ${id}`);
    //             resolve(id);
    //         }, 1000);
    //     });
    // }
    var responseAll = [];
    return queue.reduce((accumulatorPromise, nextItem) => {
        return accumulatorPromise.then(() => {
            return nextItem(sitesData).then(res => {
				console.log(res, 'resresresresresresres ******************************************')
                responseAll.push(res);
                return responseAll;
            });
        });
    }, Promise.resolve());
    
};