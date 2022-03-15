const cron = require('node-cron');
const commonConsts = require('../../../configs/commonConsts');

const { fetchCumulativeReportingData } = require('./utils/reporting');
const {
	getMaxImpressionUnits,
	enablePoweredByBannerFlag,
	getRecentlyOnboardedSites
} = require('./utils/site');
const config = require('../../../configs/config');
const siteModel = require('../../../models/siteModel');
const { sendEmail } = require('../../../helpers/queueMailer');

const sitesToProcess =
	(config.poweredByAdpushupBannerService && config.poweredByAdpushupBannerService.enableOnSites) ||
	[];

const main = async function(siteId) {
	try {
		const { data } = await siteModel.getSiteById(siteId);
		const reportingResponse = await fetchCumulativeReportingData(siteId);

		//Do Nothing in case of insufficient reporting data for ad units
		if (!reportingResponse || reportingResponse.length < 1) return;

		//fetch units with the most impressions
		const maxImpressionUnits = await getMaxImpressionUnits(data, reportingResponse);

		//enable poweredByAdpushup flag in CB for fetched units
		await enablePoweredByBannerFlag(data, maxImpressionUnits);
		return;
	} catch (err) {
		const errorMessage = `Powered By Adpushup banner service error. Service failed for siteId : ${siteId} with error : ${err}`;
		console.log(errorMessage);
		sendEmail({
			queue: 'MAILER',
			data: {
				to: config.poweredByAdpushupBannerService.supportMail,
				body: errorMessage,
				subject: 'Powered By Adpushup banner Service'
			}
		});
	}
};

const init = async () => {
	try {
		console.log('Powered By Adpushup banner service running...');

		if (sitesToProcess.length < 1) {
			//fetch recently onboarded site list
			const siteList = await getRecentlyOnboardedSites();
			await Promise.all(siteList.map(main));
			return;
		}
	} catch (err) {
		console.log('Powered By Adpushup banner service error :', err);
	}
};
init();

var cronJob = cron.schedule(commonConsts.cronSchedule.poweredByAdpushupBannerService, init, false);
cronJob.start();
