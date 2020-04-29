// Global constants

var constants = {
	EVENTS: {
		GPT: {
			SLOT_RENDER_ENDED: 'slotRenderEnded'
		},
		PREBID: {
			BID_WON: 'bidWon',
			BID_TIMEOUT: 'bidTimeout',
			AUCTION_END: 'auctionEnd'
		}
	},
	TARGETING: {
		PAGE_LEVEL: {
			da: 'adx'
		},
		UTM_LEVEL: {
			STANDARD: {
				UTM_SOURCE: 'utm_source',
				UTM_CAMPAIGN: 'utm_campaign',
				UTM_MEDIUM: 'utm_medium',
				UTM_TERM: 'utm_term',
				UTM_CONTENT: 'utm_content'
			},
			CUSTOM: {
				UTM_SCM: {
					TARGET: {
						UTM_SOURCE: 'utm_source',
						UTM_CAMPAIGN: 'utm_campaign',
						UTM_MEDIUM: 'utm_medium'
					}
				},
				UTM_SOURCE_CAMPAIGN: {
					TARGET: {
						UTM_SOURCE: 'utm_source',
						UTM_CAMPAIGN: 'utm_campaign'
					}
				}
			}
		},
		ADX_FLOOR: {
			priceFloorKeys: ['FP_S_A', 'FP_S', 'FP_B', 'FP_B_A', 'FP_A'],
			cpm: 0.01,
			key: 'FP_S_A'
		}
	},
	ERROR_CODES: {
		NO_ERROR: 1
	},
	FEEDBACK: {
		DEFAULT_WINNER: 'adx',
		URL: '//e3.adpushup.com/AdPushupFeedbackWebService/feedback/aphb?data=',
		AUCTION_FEEDBACK_URL:
			'//e3.adpushup.com/AdPushupFeedbackWebService/feedback/aphb/auctionData?data=',
		URL_OLD: '//e3.adpushup.com/ApHbWebService/feedback',
		HB_TYPES: { client: 1, server: 2 }
	},
	PREBID: {
		TIMEOUT: 3000,
		BIDDER_SEQUENCE: 'random',
		PRICE_GRANULARITY: 'dense',
		VIDEO_FORMAT_TYPE: 'outstream',
		DEFAULT_FORMATS: ['display'],
		ALL_SUPPORTED_FORMATS: ['display', 'video', 'native']
	},
	ADSERVER_TARGETING_KEYS: {
		BIDDER: 'hb_ap_bidder',
		AD_ID: 'hb_ap_adid',
		CPM: 'hb_ap_pb',
		SIZE: 'hb_ap_size',
		SOURCE: 'hb_ap_source',
		FORMAT: 'hb_ap_format',
		SITE_ID: 'hb_ap_siteid',
		HB_RAN: 'hb_ap_ran',
		ADPUSHUP_RAN: 'adpushup_ran',
		REFRESH_COUNT: 'refreshcount',
		REFRESH_RATE: 'refreshrate',
		FLUID: 'fluid'
	},
	AD_SIZE_MAPPING: {
		IAB_SIZES: {
			ALL: [
				[120, 600],
				[160, 600],
				[200, 200],
				[240, 400],
				[250, 250],
				[300, 50],
				[300, 100],
				[300, 250],
				[300, 600],
				[320, 50],
				[320, 100],
				[320, 480],
				[336, 280],
				[468, 60],
				[480, 320],
				[580, 400],
				[690, 90],
				[675, 90],
				[670, 90],
				[650, 90],
				[630, 90],
				[600, 90],
				[720, 300],
				[728, 90],
				[728, 250],
				[728, 280],
				[900, 90],
				[970, 90],
				[970, 250]
			],
			MULTIPLE_AD_SIZES_WIDTHS_MAPPING: {
				'120': [[120, 600]],
				'160': [[120, 600], [160, 600]],
				'200': [[200, 200]],
				'240': [[200, 200], [240, 400]],
				'250': [[200, 200], [250, 250]],
				'300': [[300, 50], [300, 100], [300, 250], [300, 600]],
				'320': [[320, 50], [320, 100], [320, 480]],
				'336': [[300, 50], [300, 100], [300, 250], [336, 280]],
				'468': [[468, 60]],
				'480': [
					[300, 50],
					[300, 100],
					[250, 250],
					[300, 250],
					[320, 50],
					[320, 100],
					[336, 280],
					[468, 60],
					[480, 320]
				],
				'580': [
					[240, 400],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[320, 480],
					[480, 320],
					[468, 60]
				],
				'600': [[600, 90], [600, 280]],
				'630': [[630, 90], [630, 280]],
				'650': [[650, 90], [650, 150], [650, 280]],
				'670': [[675, 90], [670, 90], [675, 280]],
				'675': [
					[675, 280],
					[675, 250],
					[670, 280],
					[670, 250],
					[650, 280],
					[650, 250],
					[630, 280],
					[630, 250],
					[600, 280],
					[600, 250],
					[336, 280],
					[300, 250],
					[675, 90],
					[670, 90],
					[650, 90],
					[630, 90],
					[600, 90]
				],
				'690': [[690, 90], [690, 280], [728, 90], [728, 250], [728, 280]],
				'720': [[720, 300], [728, 90], [728, 250], [728, 280]],
				'728': [
					[300, 250],
					[336, 280],
					[728, 90],
					[728, 250],
					[728, 280],
					[300, 250],
					[728, 90],
					[728, 250],
					[728, 90],
					[728, 250],
					[728, 280]
				],
				'900': [
					[728, 90],
					[900, 90],
					[728, 250],
					[728, 280],
					[580, 400],
					[240, 400],
					[728, 400],
					[728, 350],
					[728, 300]
				],
				'970': [
					[970, 90],
					[970, 250],
					[728, 250],
					[728, 280],
					[728, 90],
					[900, 90],
					[580, 400],
					[240, 400],
					[728, 400],
					[728, 350],
					[728, 300]
				]
			},
			// The backward compatible size array for every ad size contains itself as well
			BACKWARD_COMPATIBLE_MAPPING: {
				// MOBILE sizes
				'120,600': [[120, 600]],
				'160,600': [[120, 600], [160, 600]],
				'200,200': [[200, 200]],
				'240,400': [[200, 200], [240, 400]],
				'250,250': [[200, 200], [250, 250]],
				'300,50': [[300, 50]],
				'300,100': [[300, 50], [300, 100]],
				'300,250': [[250, 250], [200, 200], [300, 100], [300, 50], [300, 75], [300, 250]],
				'300,600': [
					[160, 600],
					[120, 600],
					[240, 400],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[300, 600]
				],
				'320,50': [[300, 50], [320, 50]],
				'320,100': [[300, 50], [300, 100], [320, 50], [320, 100]],
				'320,480': [[300, 50], [300, 100], [300, 250], [320, 50], [320, 100], [320, 480]],
				'336,280': [[300, 50], [300, 100], [300, 250], [336, 280]],
				// TABLET sizes
				'468,60': [[468, 60]],
				'480,320': [
					[300, 50],
					[300, 100],
					[250, 250],
					[300, 250],
					[320, 50],
					[320, 100],
					[336, 280],
					[468, 60],
					[480, 320]
				],
				'580,400': [
					[240, 400],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[480, 320],
					[468, 60],
					[580, 400]
				],

				'728,400': [
					[728, 350],
					[728, 300],
					[728, 280],
					[728, 250],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[320, 480],
					[480, 320],
					[468, 60],
					[728, 400]
				],

				'728,350': [
					[728, 300],
					[728, 280],
					[728, 250],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[480, 320],
					[468, 60],
					[728, 350]
				],
				'728,300': [
					[728, 280],
					[728, 250],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[480, 320],
					[468, 60],
					[728, 300]
				],

				// DESKTOP sizes
				'720,300': [
					[300, 250],
					[336, 280],
					[690, 90],
					[675, 90],
					[670, 90],
					[650, 90],
					[630, 90],
					[600, 90],
					[720, 300]
				],
				'728,90': [
					[690, 90],
					[675, 90],
					[670, 90],
					[650, 90],
					[630, 90],
					[600, 90],
					[728, 90]
				],
				'690,90': [[600, 90], [675, 90], [670, 90], [650, 90], [630, 90], [690, 90]],
				'690,280': [
					[690, 250],
					[675, 280],
					[675, 250],
					[670, 280],
					[670, 250],
					[650, 280],
					[650, 250],
					[630, 280],
					[630, 250],
					[600, 280],
					[600, 250],
					[336, 280],
					[300, 250],
					[690, 280]
				],
				'675,90': [[670, 90], [650, 90], [630, 90], [600, 90], [675, 90]],
				'675,280': [
					[675, 250],
					[670, 280],
					[670, 250],
					[650, 280],
					[650, 250],
					[630, 280],
					[630, 250],
					[600, 280],
					[600, 250],
					[336, 280],
					[300, 250],
					[675, 280]
				],
				'670,90': [[650, 90], [630, 90], [600, 90], [670, 90]],
				'670,280': [
					[670, 250],
					[650, 280],
					[650, 250],
					[630, 280],
					[630, 250],
					[600, 280],
					[600, 250],
					[336, 280],
					[300, 250],
					[670, 280]
				],
				'650,90': [[630, 90], [600, 90], [650, 90]],
				'650,150': [
					[650, 90],
					[630, 90],
					[600, 90],
					[602, 100],
					[580, 90],
					[570, 90],
					[550, 150],
					[468, 60],
					[320, 100],
					[650, 150]
				],
				'650,280': [
					[650, 250],
					[630, 280],
					[630, 250],
					[600, 280],
					[600, 250],
					[336, 280],
					[300, 250],
					[650, 280]
				],
				'630,90': [[600, 90], [630, 90]],
				'630,280': [[630, 250], [600, 280], [600, 250], [336, 280], [300, 250], [630, 280]],
				'600,90': [[600, 90]],
				'600,280': [[600, 250], [336, 280], [300, 250], [600, 280]],
				'728,250': [[300, 250], [728, 90], [728, 250]],
				'728,280': [
					[728, 250],
					[336, 280],
					[300, 250],
					[250, 250],
					[200, 200],
					[300, 100],
					[300, 50],
					[300, 75],
					[480, 320],
					[468, 60],
					[728, 90],
					[728, 280]
				],
				'900,90': [[728, 90], [900, 90]],
				'970,90': [[728, 90], [900, 90], [970, 90]],
				'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]]
			},
			BLACK_LIST: [[120, 600], [160, 600], [300, 600]]
		},
		BACKWARD_COMPATIBLE_MAPPING: {
			// MOBILE sizes
			'120x600': [[120, 600]],
			'160x600': [[120, 600], [160, 600]],
			'200x200': [[200, 200]],
			'240x400': [[200, 200], [240, 400]],
			'250x250': [[200, 200], [250, 250]],
			'300x50': [[300, 50]],
			'300x100': [[300, 50], [300, 100]],
			'300x250': [[300, 250]],
			'300x600': [[160, 600], [300, 250], [300, 600]],
			'320x50': [[320, 50]],
			'320x100': [[320, 50], [320, 100]],
			'320x480': [[300, 250], [320, 50], [320, 100], [320, 480]],
			'336x280': [[300, 250], [336, 280]],
			// TABLET sizes
			'468x60': [[468, 60]],
			'480x320': [
				[250, 250],
				[300, 250],
				[320, 50],
				[320, 100],
				[336, 280],
				[468, 60],
				[480, 320]
			],
			// DESKTOP sizes
			'720x300': [[300, 250], [336, 280], [720, 300]],
			'728x90': [[728, 90]],
			'728x250': [[300, 250], [728, 90], [728, 250]],
			'728x280': [[300, 250], [336, 280], [728, 90], [728, 250], [728, 280]],
			'900x90': [[728, 90], [900, 90]],
			'970x90': [[728, 90], [900, 90], [970, 90]],
			'970x250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]],
			// RESPONSIVE size
			responsivexresponsive: [
				[120, 600],
				[160, 600],
				[200, 200],
				[240, 400],
				[250, 250],
				[300, 50],
				[300, 100],
				[300, 250],
				[300, 600],
				[320, 50],
				[320, 100],
				[320, 480],
				[336, 280],
				[468, 60],
				[480, 320],
				[720, 300],
				[728, 90],
				[728, 250],
				[728, 280],
				[900, 90],
				[970, 90],
				[970, 250]
			]
		}
	},
	NETWORK_ID: 103512698,
	BATCHING_INTERVAL: 50,
	UTM_SESSION_COOKIE: '_adp_utm_session_',
	VIDEO_PLAYER_EXCEPTION_SIZES: [[300, 250], [480, 320], [320, 480], [320, 50]],
	DEFAULT_JW_PLAYER_SIZE: [640, 480]
};

module.exports = constants;
