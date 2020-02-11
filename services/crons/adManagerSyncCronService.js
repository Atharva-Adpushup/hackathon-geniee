const cron = require('node-cron');

const runService = require('../adManagerSyncService/syncService');
const constants = require('../../configs/commonConsts');

cron.schedule(constants.cronSchedule.adManagerSyncService, runService);
