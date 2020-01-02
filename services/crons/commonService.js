const cron = require('node-cron');

const udpateActiveSitesStaus = require('./activeSitesMarkingService');
const saveAdsTxtEntries = require('./adsTxtEntriesService');
const constants = require('../../configs/commonConsts');

function initiateService() {
	[udpateActiveSitesStaus, saveAdsTxtEntries].reduce((previous, nextTask) => {
		return previous
			.then(() => {
				// return nextTask();
			})
			.catch(err => console.log(err))
			.finally(() => nextTask());
	}, Promise.resolve());
}

// initiateService();
cron.schedule(constants.cronSchedule.activeSiteMarkingAndAdsTxtService, initiateService);
