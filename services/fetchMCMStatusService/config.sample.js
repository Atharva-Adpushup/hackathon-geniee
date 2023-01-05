const globalConfig = require('../../configs/config');

module.exports = {
	authConfig: {
		client_id: globalConfig.googleOauth.OAUTH_CLIENT_ID, 
		client_secret: globalConfig.googleOauth.OAUTH_CLIENT_SECRET, 
		refresh_token: globalConfig.ADPUSHUP_GAM.REFRESH_TOKEN,
		redirect_url: globalConfig.googleOauth.OAUTH_CLIENT_ID
	},
	networkCode: globalConfig.ADPUSHUP_GAM.ACTIVE_DFP_NETWORK, 
	appName: 'Web client 2',
	dfpApiVersion: 'v202208',
	statusUpdateEmail: ['yash.bhardwaj@adpushup.com'],
	errorEmail: [
		'ravi.jagga@adPushup.com',
		'divyanshu.bhatnagar@adpushup.com',
		'anil.panghal@adpushup.com',
		'rahul.ranjan@adpushup.com',
		'yash.bhardwaj@adpushup.com'
	],
	maximum_Retries: 3
};
