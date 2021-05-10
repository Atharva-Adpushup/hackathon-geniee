const cron = require('node-cron');

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

cron.schedule('27 14 * * *', () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.Criteo);
});

cron.schedule('27 14 * * *', () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.Pubmatic);
});

cron.schedule('27 14 * * *', () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.OFT);
});

cron.schedule('27 14 * * *', () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.IndexExchange);
});

cron.schedule('27 14 * * *', () => {
	startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST.OpenX);
});
