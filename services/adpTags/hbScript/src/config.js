module.exports = {
	PREBID_TIMEOUT: 3000,
	NETWORK_ID: 103512698,
	GENIEE_NETWORK_ID: 9116787,
	SITE_ID: __SITE_ID__,
	INVENTORY: __INVENTORY__,
	PAGE_KEY_VALUES: { da: 'adx' },
	TARGETING: {},
	PARTNERS: {
		GENIEE: 'geniee'
	},
	UTM_SESSION_COOKIE: '_adp_utm_session_',
	UTM_WISE_TARGETING: {
		UTM_SOURCE: 'utm_source',
		UTM_CAMPAIGN: 'utm_campaign',
		UTM_MEDIUM: 'utm_medium',
		UTM_TERM: 'utm_term',
		UTM_CONTENT: 'utm_content'
	},
	GPT_REFRESH_INTERVAL: 30000,
	SLOT_INTERVAL: 50,
	MEDIATION_API_URL: '//s2s.adpushup.com/MediationWebService/',
	HB_STATUS: {
		API_URL: 'http://apdc1-adblock.eastus2.cloudapp.azure.com/api/',
		EVENTS: {
			HB_START: 'HB_START',
			HB_END: 'HB_END',
			HB_RENDER: 'HB_RENDER',
			HB_DFP_RENDER: 'HB_DFP_RENDER'
		}
	},
	ADSENSE_RENDER_EVENT: 'adsenseRenderEvent',
	ADSENSE_FALLBACK_ADCODE: '<script>parent.postMessage(__AD_CODE__, parent.location.href);</script>',
	ADSENSE: {
		cpm: 0.01,
		bidderName: 'adsensefallback'
	},
	ADX: {
		adCode:
			'<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:inline-block;width:__SIZE_W__px;height:__SIZE_H__px" data-ad-client="ca-pub-8933329999391104" data-ad-slot="HB_FALLBACK"></ins><script>(adsbygoogle=window.adsbygoogle || []).push({});</script>',
		cpm: 0.01,
		bidderName: 'adxbackfill'
	},
	ADX_FLOOR: {
		priceFloorKeys: ['FP_S_A', 'FP_S', 'FP_B', 'FP_B_A', 'FP_A'],
		//Use this key to override floor
		cpm: 0.01,
		key: 'FP_S_A' // FP_B, FP_A, FP_S, FP_B_A, FP_S_A (key available, FP - floor price, B-Branded, S-Semi transparent, A-Anonymous)
	},
	C1X: {
		pixelId: 1236239
	},
	DEFAULT_WINNER: 'adx',
	FEEDBACK_URL: '//staging.adpushup.com/AdPushupFeedbackWebService/feedback/aphb?data=',
	POSTBID_PASSBACKS: {
		'*': 'PGgxPkJPTyBZQUghPC9oMT4='
	},
	KEEN_IO: {
		PROJECT_ID: '5922a50995cfc9addc2480dd',
		WRITE_KEY: '40C0401741E18AFC5F17B722BA6371984333FDD0C36101019C7C107C1E1334B4',
		EVENTS: {
			IMPRESSION: 'impression'
		}
	},
	CURRENCY_CODES: {
		USD: 'USD',
		INR: 'INR',
		EUR: 'EUR'
	}
};
