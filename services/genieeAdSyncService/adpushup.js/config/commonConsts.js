module.exports = {
	DEFAULT_FIND_CMP_TIMEOUT: 300,
	CMP_CHECK_EXCLUDED_SITES: [38903],
	// prettier-ignore
	EU_COUNTRY_LIST: ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "GF", "GP", "MQ", "ME", "YT", "RE", "MF", "GI", "AX", "PM", "GL", "BL", "SX", "AW", "CW", "WF", "PF", "NC", "TF", "AI", "BM", "IO", "VG", "KY", "FK", "MS", "PN", "SH", "GS", "TC", "AD", "LI", "MC", "SM", "VA", "JE", "GG", "GI"],
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
	USER_SYNC_URL: '//e3.adpushup.com/AdPushupFeedbackWebService/user/sync',
	GOOGLE_ANALYTICS_URL: 'https://www.googletagmanager.com/gtag/js?id=',
	GOOGLE_ANALYTICS_ID: 'G-Z0TZ7TDHS1',
	BEACON_TYPE: {
		AD_FEEDBACK: 'AD_FEEDBACK'
	},
	AD_STATUS: {
		IMPRESSION: 1,
		XPATH_MISS: 2
	},
	SERVICES: {
		LAYOUT: 1,
		TAG: 2,
		HB: 3,
		MEDIATION: 4,
		INTERACTIVE_AD: 5,
		AP_LITE: 6
	},
	ERROR_CODES: {
		UNKNOWN: 0,
		NO_ERROR: 1,
		PAGEGROUP_NOT_FOUND: 2,
		FALLBACK_PLANNED: 3,
		FALLBACK_FORCED: 4,
		PAUSED_IN_EDITOR: 5,
		VARIATION_NOT_SELECTED: 6
	},
	MODE: {
		ADPUSHUP: 1,
		FALLBACK: 2
	},
	PAGE_VARIATION_TYPE: {
		NON_BENCHMARK: 1,
		BENCHMARK: 2
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
	AD_REFRESH_INTERVAL: 30000,
	SCREEN_ORIENTATIONS_FEEDBACK_VALUE: {
		'landscape-primary': 1,
		'landscape-secondary': 1,
		'portrait-primary': 2,
		'portrait-secondary': 2
	},
	AD_UNIT_TYPE_MAPPING: {
		DISPLAY: 1,
		DOCKED: 2,
		STICKY: 3,
		// AMP: 4,
		REWARDED: 5,
		INSTREAM: 6
	},
	EVENT_LOGGER: {
		EVENTS: {
			EMPTY: 'EMPTY',
			MAIN_FN_CALL_DELAY: 'MAIN_FN_CALL_DELAY',
			AUCTION_START_DELAY: 'AUCTION_START_DELAY',
			AUCTION_END_DELAY: 'AUCTION_END_DELAY',
			// ---- URM Events ----
			URM_START: 'URM_START',
			URM_RESPONSE_TIME: 'URM_RESPONSE_TIME',
			URM_REQUEST_FAILED: 'URM_REQUEST_FAILED',
			URM_REQUEST_FAILED_TIME: 'URM_REQUEST_FAILED_TIME',
			URM_REQUEST_STARTED: 'URM_REQUEST_STARTED',
			URM_REQUEST_SUCCESS: 'URM_REQUEST_SUCCESS',
			URM_CONFIG_NOT_FOUND: 'URM_CONFIG_NOT_FOUND',
			URM_CONFIG_KEY_VALUE_SET: 'URM_CONFIG_KEY_VALUE_SET',
			URM_CONFIG_KEY_VALUE_EMPTY: 'URM_CONFIG_KEY_VALUE_EMPTY',
			URM_TARGETING_KEY_VALUE_SET: 'URM_TARGETING_KEY_VALUE_SET',
			URM_TARGETING_KEY_VALUE_EMPTY: 'URM_TARGETING_KEY_VALUE_EMPTY'
		},
		TYPES: {
			ADP_PERF: 'ADP_PERF',
			URM_KEY_VALUE: 'URM_KEY_VALUE',
			URM_KEY_VALUE_KEEN: 'URM_KEY_VALUE_KEEN',
			URM_TARGETTING: 'URM_TARGETTING',
			URM_TARGETTING_KEEN: 'URM_TARGETTING_KEEN',
			URM_PAGE_FEEDBACK: 'URM_PAGE_FEEDBACK'
		}
	},
	URM_REPORTING: {
		GET_URM_TARGETTING_REQUEST_TIMEOUT: 0,
		EVENTS: {
			SUCCESS: 'success',
			FAILED: 'failed',
			PENDING: 'pending'
		}
	},
	LIGHTHOUSE_HACK_SITES: [41619, 41584],
	POWERED_BY_BANNER: {
		HEIGHT: 16,
		TEXT: 'Ads by',
		IMAGE: 'https://campaign.adpushup.com/ads/adpushup-label.svg',
		REDIRECT_URL:
			'https://campaign.adpushup.com/get-started/?utm_source=banner&utm_campaign=growth_hack',
		CSS: {
			COMMON: {
				color: '#000',
				fontFamily: 'sans-serif',
				fontSize: 9,
				display: 'none',
				textDecoration: 'none',
				background: 'transparent',
			},
			LOGO: {
				display: 'inline-block',
				height: '16px !important', // required because some sites override img styles and logo height gets overriden,
				'vertical-align': 'middle',
				'margin-top': '0px',
				'margin-bottom': '0px'
			}
		},
		SUPPORTED_PLATFORMS: ['DESKTOP'],
		SUPPORTED_FORMATS: ['STICKYBOTTOM'],
	},
	GA_EVENTS: {
		SCRIPT_LOADED: 'script-load',
		PAGE_VIEW: 'ap-page-view'
	}
};
