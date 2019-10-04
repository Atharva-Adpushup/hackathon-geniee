// Common constants

const commonConsts = {
	MANUAL_ADS: {
		VARIATION: 'manual'
	},
	NETWORKS: {
		ADPTAGS: 'adpTags'
	},
	BEACON_TYPE: {
		AD_FEEDBACK: 'AD_FEEDBACK'
	},
	SERVICES: {
		LAYOUT: 1,
		TAG: 2,
		HB: 3,
		MEDIATION: 4,
		INTERACTIVE_AD: 5
	},
	ERROR_CODES: {
		NO_ERROR: 1,
		PAGEGROUP_NOT_FOUND: 2
	},
	EVENTS: {
		DOM_LOAD: 'DOMContentLoaded',
		SCROLL: 'scroll',
		SCRIPT_LOAD: 'scriptLoaded'
	},
	DEFAULT_CLASSNAME: 'adp_interactive_ad',
	FORMAT_CSS: {
		background: '#eaeaea'
	},
	CLOSE_BUTTON: {
		IMAGE:
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 15 15"><path d="M3.25,3.25l8.5,8.5M11.75,3.25l-8.5,8.5"></path></svg>',
		CSS: {
			COMMON: {
				position: 'absolute',
				top: '2px',
				right: '2px',
				height: '15px',
				width: '15px',
				stroke: '#fff',
				cursor: 'pointer',
				'stroke-width': 1.25
			},
			BOTTOM: {
				// top: -15
			},
			TOP: {
				// bottom: -15
			}
		}
	},
	POWERED_BY_BANNER: {
		HEIGHT: 20,
		TEXT: 'Ads by',
		IMAGE: 'https://console.adpushup.com/assets/images/logo-white-200X50.png',
		REDIRECT_URL:
			'https://campaign.adpushup.com/get-started/?utm_source=banner&utm_campaign=growth_hack',
		CSS: {
			COMMON: {
				color: '#fff',
				fontFamily: 'sans-serif',
				fontSize: 9,
				display: 'inline-block',
				padding: '2px 6px',
				textDecoration: 'none'
			},
			LOGO: {
				'max-width': '75px',
				height: '14px',
				'vertical-align': 'middle',
				'margin-left': '2px'
			}
		}
	},
	FRAME: {
		CSS: {
			COMMON: {
				background: 'rgba(0,0,0,0.5)',
				'padding-bottom': '2px',
				'max-height': '20px',
				margin: '0px auto',
				position: 'relative'
			},
			DISABLED_BANNER: {
				height: '20px'
			},
			LEFT: {},
			RIGHT: {},
			BOTTOM: {},
			TOP: {
				width: '170px',
				'border-radius': '5px 5px 0px 0px',
				padding: '2px'
			}
		}
	},
	FORMATS: {
		STICKY: {
			NAME: 'sticky',
			BASE_STYLES: {
				position: 'fixed',
				zIndex: 2000
			},
			PLACEMENT_CSS: {
				TOP: {
					top: 0,
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0,
					padding: '10px 0px',
					width: '100%',
					'box-sizing': 'content-box'
				},
				BOTTOM: {
					bottom: 0,
					marginLeft: 'auto',
					marginRight: 'auto',
					left: 0,
					right: 0
				},
				LEFT: {
					left: 0,
					'margin-left': '5px'
					// bottom: 0
				},
				RIGHT: {
					right: 0,
					'margin-right': '5px'
					// bottom: 0
				}
			}
		},
		IN_VIEW: {
			NAME: 'inview',
			WAIT_TIMEOUT: 3000,
			BASE_STYLES: {
				position: 'relative',
				display: 'inline-block'
			}
		},
		DOCKED: {
			NAME: 'docked'
		},
		VIDEO: {
			NAME: 'video',
			EVENTS: {
				AD_ERROR: 'adserror',
				AD_STARTED: 'ads-ad-started'
			},
			RECOMMENDATION: {
				API_URL: '//e3.adpushup.com/VideoRecommendWebService/video/recommend?keywords=',
				MAPPING: {
					1: ['bitcoin', 'news', 'crypto', 'ether', 'buy', 'sell'],
					2: ['blockchain', 'bitcoin', 'crypto', 'ripple'],
					3: ['sports', 'india', 'cricket', 'worldcup'],
					4: ['sports', 'india', 'world', 'cricket', 'cup', 'kohli'],
					5: ['food', 'lifestyle', 'fashion', 'news', 'buy', 'sell'],
					6: [
						'BJP',
						'budget 2018',
						'Cvoter Budget Tracker 2018',
						'Demonetisation',
						'economic reforms',
						'Economic Survey 2018'
					],
					7: [
						'economy 2018',
						'expenditure',
						'gdp. gross domestic product',
						'Goods and Services Tax',
						'GST',
						'india today and cvoter republic poll',
						"narebdra modi's reform initiatives",
						'Narendra Modi',
						'personal income',
						'standard deductions',
						'Tax slabs'
					],
					8: [
						'2G',
						'2G scam',
						'2G Spectrum',
						'2g spectrum allocation scam',
						'2G Verdict',
						'A Raja',
						'A Raja letter',
						'cbi',
						'Central Bureau of Investigation',
						'Central Vigilance Commission'
					]
				}
			},
			DEFAULT_PLAYER_CONFIG: {
				controls: true,
				muted: true,
				autoplay: true,
				preload: 'none',
				playsinline: true
			},
			DEFAULT_TITLE_CSS: {
				backgroundColor: '#1F232C',
				color: '#fff',
				fontSize: 12,
				textOverflow: 'ellipsis',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				padding: '10px',
				boxSizing: 'border-box'
			},
			DEFAULT_CLASS: 'video-js',
			DEFAULT_AD_TAG_URL:
				'https://ima3vpaid.appspot.com/?adTagUrl=https%3A%2F%2Fgoogleads.g.doubleclick.net%2Fpagead%2Fads%3Fclient%3Dca-video-pub-8933329999391104%26ad_type%3Dvideo%26description_url%3D__DESCRIPTION_URL__%26max_ad_duration%3D30000%26videoad_start_delay%3D0&type=js'
		}
	}
};

export default commonConsts;
