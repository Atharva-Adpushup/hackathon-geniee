const cron = require('node-cron');

const runService = require('../fetchMCMStatusService/fetchMCMStatus');
const constants = require('../../configs/commonConsts');

const config = require('../../configs/config');

if (config.environment.HOST_ENV === 'production') {
	process.on('uncaughtException', error => {
		console.log(error.stack);
		setTimeout(() => process.exit(1), 2000);
	});

	process.on('unhandledRejection', error => {
		console.log(error.stack);
		setTimeout(() => process.exit(1), 2000);
	});
}
cron.schedule(constants.cronSchedule.fetchMCMStatusService, runService);
