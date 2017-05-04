const Promise = require('bluebird'),
	moment = require('moment'),
	CC = require('../../configs/commonConsts'),
	{ MESSAGES, SITE, DATE } = require('./constants/index'),
	universalReportService = require('../../reports/universal/index');

module.exports = {
	init: (site) => {
		return new Promise((resolve, reject) => {
			const isGenieePartner = !!(site.get('partner') && (site.get('partner') === CC.partners.geniee.name) && site.get('genieeMediaId'));

			if (!isGenieePartner) { return reject(new Error(MESSAGES.SITE_INVALID)); }

			const isMode = !!(site.get('apConfigs') && site.get('apConfigs').mode),
				siteMode = isMode ? site.get('apConfigs').mode : false,
				isModePublish = !!(isMode && (SITE.MODE.PUBLISH === siteMode)),
				isModeDraft = !!(isMode && (SITE.MODE.DRAFT === siteMode)),

				isSiteId = !!(site.get('siteId')),
				siteId = isSiteId ? site.get('siteId') : false,

				oneDayBeforeDate = moment().subtract(1, 'days').format(DATE.FORMAT['y-m-d']),
				twoDaysBeforeDate = moment().subtract(2, 'days').format(DATE.FORMAT['y-m-d']),

				getOneDayBeforeReport = universalReportService.getReportData(site, oneDayBeforeDate, oneDayBeforeDate),
				getTwoDaysBeforeReport = universalReportService.getReportData(site, twoDaysBeforeDate, twoDaysBeforeDate);

				return Promise.join(getOneDayBeforeReport, getTwoDaysBeforeReport, (oneDayBeforeReport, twoDaysBeforeReport) => {
					console.log('One day before: ', oneDayBeforeReport);
					console.log('Two days before: ', twoDaysBeforeReport);

					return resolve(MESSAGES.MAIL_SUCCESS);
				});
		});
	}
};
