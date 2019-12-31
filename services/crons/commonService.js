const cron = require('node-cron');

const udpateActiveSitesStaus = require('./activeSitesMarkingService');
const saveAdsTxtEntries = require('./adsTxtEntriesService');
const constants = require('../../configs/commonConsts');

function initiateService() {
	[udpateActiveSitesStaus, saveAdsTxtEntries].reduce((previous, nextTask) => {
		return previous.then(() => {
			return nextTask();
		});
	}, Promise.resolve());
}

cron.schedule(constants.cronSchedule.activeSiteMarkingAndAdsTxtService, initiateService);
