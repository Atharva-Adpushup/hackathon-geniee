const { SITE_SYNCING_ERROR, QUEUE_NAMES } = require('../../configs/commonConsts');
const { SITE_SYNC_ERROR_ALERT_REPORTER, deployment } = require('../../configs/config');
const { isCouchBaseDocDoesNotExistError } = require('../../helpers/commonFunctions');
const { sendEmail } = require('../../helpers/queueMailer');
const adsSyncService = require('./adsSyncService/index');

function init(siteId, forcePrebidBuild, options = {}) {
	return adsSyncService
		.publish(siteId, forcePrebidBuild, options)
		.then(response =>
			response && response.hasOwnProperty('empty')
				? console.log(response.message)
				: console.log(response)
		)
		.catch(err => {
			const isCouchBaseDocNotExist = isCouchBaseDocDoesNotExistError(err);
			if (isCouchBaseDocNotExist) {
				return;
			}

			let parsedSiteId = parseInt(siteId, 10);
			if (isNaN(parsedSiteId)) {
				parsedSiteId = siteId.get('siteId');
			}

			sendEmail({
				queue: QUEUE_NAMES.MAILER,
				data: {
					to: SITE_SYNC_ERROR_ALERT_REPORTER,
					subject: `${SITE_SYNCING_ERROR} - ${parsedSiteId} - [${deployment}]`,
					body: err.toString()
				}
			});
		})
		.catch(console.log);
}

module.exports = { init };
