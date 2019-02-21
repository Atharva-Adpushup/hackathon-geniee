module.exports = {
	AD_TYPES: {
		STRUCTURAL: 1,
		IN_CONTENT: 2,
		INTERACTIVE_AD: 3,
		DOCKED_STRUCTURAL: 4,
		EXTERNAL_TRIGGER_AD: 5
	},
	DOCKED_CSS: {
		position: 'fixed',
		top: '0px',
		'z-index': 10000
	},
	LAZY_LOAD: {
		SCROLL_THRESHOLD: 100
	},
	MANUAL_ADS: {
		VARIATION: 'manual'
	},
	NETWORKS: {
		ADPTAGS: 'adpTags',
		ADSENSE: 'adsense',
		ADX: 'adx',
		MEDIANET: 'medianet'
	},
	AMP_PUBLISH_URL: '//autoamp.io/publishAmpJob',
	USER_SYNC_URL: '//staging.adpushup.com/AdPushupFeedbackWebService/user/sync',
	BEACON_TYPE: {
		AD_FEEDBACK: 'AD_FEEDBACK'
	},
	AD_STATUS: {
		IMPRESSION: 1,
		XPATH_MISS: 2
	},
	COOKIE: {
		NAME: '_adp_utm_session_',
		EXPIRY: 30
	},
	UTM_WISE_TARGETING: {
		UTM_SOURCE: 'utm_source',
		UTM_CAMPAIGN: 'utm_campaign',
		UTM_MEDIUM: 'utm_medium',
		UTM_TERM: 'utm_term',
		UTM_CONTENT: 'utm_content'
	},
	PLATFORMS: {
		RESPONSIVE: 'RESPONSIVE',
		DESKTOP: 'DESKTOP',
		MOBILE: 'MOBILE'
	},
	ADPUSHUP_MEDIANET_ID: '8CUEJU9TP',
	AD_REFRESH_INTERVAL: 30000
};
