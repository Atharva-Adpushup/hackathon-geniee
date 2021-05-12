const cron = require('node-cron');
const { cronSchedule: { partnersPanelService } } = require('./configs/commonConsts');

const {
	startPartnersPanelsAnomaliesDetectionService
} = require('./services/crons/partnersPanelAnomalyDetectionCronService');

const PARTNERS_LIST = {
	Criteo: 'Criteo',
	Pubmatic: 'Pubmatic',
	OFT: 'OFT',
	IndexExchange: 'IndexExchange',
	OpenX: 'OpenX'
};
console.log(partnersPanelService, 'partnersPanelService')
cron.schedule(partnersPanelService.Criteo, () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.Criteo);
});

cron.schedule(partnersPanelService.Pubmatic, () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.Pubmatic);
});

cron.schedule(partnersPanelService.OFT, () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.OFT);
});

cron.schedule(partnersPanelService.IndexExchange, () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.IndexExchange);
});

cron.schedule(partnersPanelService.OpenX, () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.OpenX);
});
