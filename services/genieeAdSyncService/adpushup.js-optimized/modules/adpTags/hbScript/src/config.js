// Site config
//var globalConfig = require('../../../../../../../configs/config');

var globalConfig = {
	prebidServer: {
		host: 'https://amp.adpushup.com/'
	}
};

var config = {
	SITE_ID: __SITE_ID__,
	PREBID_CONFIG: __PREBID_CONFIG__,
	PAGE_KEY_VALUES: { da: 'adx' },
	TARGETING: {},
	SIZE_MAPPING: __SIZE_MAPPING__,
	S2S_CONFIG: {
		S2S_ENABLED: __WEB_S2S_STATUS__,
		S2S_AUCTION_ENDPOINT: `${globalConfig.prebidServer.host}prebidserver/openrtb2/auction`,
		S2S_SYNC_ENDPOINT: `${globalConfig.prebidServer.host}prebidserver/cookie_sync`,
		S2S_ACCOUNT_ID: '1001'
	},
	VIDEO_WAIT_LIMIT_DISABLED: __VIDEO_WAIT_LIMIT_DISABLED__,
	POST_BID_SUPPORTED_BIDDERS: [
		'nobid',
		'pubmatic',
		'rubicon',
		'eplanning',
		'ix',
		'sovrn',
		'appnexus',
		'conversant'
	]
};

module.exports = config;