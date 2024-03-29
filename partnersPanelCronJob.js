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

if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
	Object.keys(PARTNERS_LIST).forEach(partner => {
	    cron.schedule(partnersPanelService[PARTNERS_LIST[partner]], () => {
	        startPartnersPanelsAnomaliesDetectionService(PARTNERS_LIST[partner]);
	    });
	})
}