// Site config

var config = {
	SITE_ID: __SITE_ID__,
	PREBID_CONFIG: __PREBID_CONFIG__,
	PAGE_KEY_VALUES: { da: 'adx' },
	TARGETING: {},
	SIZE_MAPPING: __SIZE_MAPPING__,
	S2S_ENABLED: true,
	S2S_AUCTION_ENDPOINT: "https://amp.adpushup.com/prebidserver/openrtb2/auction",
	S2S_SYNC_ENDPOINT: "https://amp.adpushup.com/prebidserver/cookie_sync"
};

module.exports = config;
