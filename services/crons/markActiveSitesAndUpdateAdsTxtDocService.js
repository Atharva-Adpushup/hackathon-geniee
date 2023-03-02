const cron = require('node-cron');

const udpateActiveSitesStaus = require('./activeSitesMarkingService');
const saveAdsTxtEntries = require('./adsTxtEntriesService');
const constants = require('../../configs/commonConsts');
const config = require('../../configs/config');
const sdClient = require('../../helpers/ServerDensityLogger');

function initiateService() {
	[udpateActiveSitesStaus, saveAdsTxtEntries].reduce((previous, nextTask) => {
		return previous
			.then(() => {
				// return nextTask();
			})
			.catch(err => console.log(err))
			.then(() => nextTask());
	}, Promise.resolve());
}

if (config.environment.HOST_ENV === 'production') {
	process.on('uncaughtException', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.CommonService');
		setTimeout(() => process.exit(1), 1000);
	});

	process.on('unhandledRejection', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.CommonService');
		setTimeout(() => process.exit(1), 1000);
	});
}

cron.schedule(constants.cronSchedule.activeSiteMarkingAndAdsTxtService, initiateService);
