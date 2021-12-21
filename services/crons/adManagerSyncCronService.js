const cron = require('node-cron');

const runService = require('../adManagerSyncService/syncService');
const constants = require('../../configs/commonConsts');

const config = require('../../configs/config');
const sdClient = require('../../helpers/ServerDensityLogger');

if (config.environment.HOST_ENV === 'production') {
	process.on('uncaughtException', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.AdManagerSyncService');
		setTimeout(() => process.exit(1), 2000);
	});

	process.on('unhandledRejection', error => {
		console.log(error.stack);
		sdClient.increment('Monitoring.AdManagerSyncService');
		setTimeout(() => process.exit(1), 2000);
	});
}

cron.schedule(constants.cronSchedule.adManagerSyncService, runService);
