const config = require('./config');

const prodEnv = config.environment.HOST_ENV === 'production';
const reportingBaseURL = 'https://api.adpushup.com/CentralReportingWebService';
const metaInfoServiceBaseUrl = 'https://api.adpushup.com/MetaInfoWebService';
const computedProductionURL = prodEnv
	? 'https://console.adpushup.com'
	: `http://localhost:${config.environment.HOST_PORT}`;
const n1qlQueryTemplates = {
	ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE: `SELECT DISTINCT RAW activeBidderAdapters
										FROM
											AppBucket _apNetworks
											UNNEST
												(
													ARRAY _apNetworks.[bidderKey].adapter
													FOR bidderKey
													IN (
														SELECT DISTINCT RAW activeBiddersHbdc
														FROM
															AppBucket _hbdc
															UNNEST
																(
																	ARRAY hbdcBidderKey
																	FOR hbdcBidderKey
																	IN OBJECT_NAMES(_hbdc.hbcf)
																	WHEN _hbdc.hbcf.[hbdcBidderKey].isPaused = false
																	AND _hbdc.hbcf.[hbdcBidderKey].isActive = true END
																)
																AS activeBiddersHbdc
														WHERE
															meta(_hbdc).id LIKE 'hbdc::%'
															AND TONUMBER(_hbdc.siteId) in (__SITES_QUERY__)
													)
												WHEN
														_apNetworks.[bidderKey] IS VALUED
														AND _apNetworks.[bidderKey].isHb = true
														AND _apNetworks.[bidderKey].isActive = true
														AND _apNetworks.[bidderKey].params IS VALUED END
												)
												AS activeBidderAdapters
										WHERE
											meta(_apNetworks).id = 'data::apNetworks'
											ORDER BY activeBidderAdapters ASC;`,
	CURRENT_SITES_N1QL: `SELECT
								RAW _site.siteId
							FROM
								AppBucket _site
							WHERE
								meta(_site).id LIKE 'site::%'
								AND (
									_site.apConfigs IS MISSING
									OR _site.apConfigs.isSelectiveRolloutEnabled IS MISSING
									OR _site.apConfigs.isSelectiveRolloutEnabled != true
								)`,
	SELECTIVE_ROLLOUT_SITES_N1QL: `SELECT
										RAW _site.siteId
									FROM
										AppBucket _site
									WHERE
										meta(_site).id LIKE 'site::%'
										AND _site.apConfigs IS VALUED
										AND _site.apConfigs.isSelectiveRolloutEnabled == true`,
	AMP_SITES_N1QL: `SELECT
							RAW _site.siteId
						FROM
							AppBucket _site
						WHERE
							meta(_site).id LIKE 'site::%'
							AND _site.apps IS VALUED
							AND _site.apps.ampScript == true`,
	AMP_SELECTIVE_ROLLOUT_SITES_N1QL: `SELECT
							RAW _site.siteId
						FROM
							AppBucket _site
						WHERE
							meta(_site).id LIKE 'site::%'
							AND _site.apps IS VALUED
							AND _site.apps.ampScript == true
							AND _site.apConfigs IS VALUED
							AND _site.apConfigs.isAmpSelectiveRolloutEnabled == true`,
	FIRST_S2S_BIDDER_SITE_TEMPLATE: `SELECT _hbdc.siteId
										FROM
											AppBucket _hbdc
										WHERE
											meta(_hbdc).id LIKE 'hbdc::%'
											AND TONUMBER(_hbdc.siteId) in (__SITES_QUERY__)
											AND ANY bidder IN OBJECT_VALUES(_hbdc.hbcf) SATISFIES bidder.isS2SActive = true END
										LIMIT 1;`
};

module.exports = {
	CORE_WEB_VITALS_API: {
		uri: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
		key: 'AIzaSyAwlPiPJIkTejgqqH01v9DmtPoPeOPXDUQ',
		headers: {
			'sec-ch-ua': '^^',
			Referer: 'https://developers.google.com/',
			'sec-ch-ua-mobile': '?0'
		}
	},

	GOOGLE_SPREAD_SHEET_ID: {
		CLS_MONITORING: '1ju3NvLOBOqUEMzX1AfqKnQtLvB28hjS1-S1mJmOh6fI',
		REPORTING_DATA: '1LJELLTJxJDPjlz07A7gTvvo59jQI_kLolyyUM89Df2M'
	},
	GOOGLE_OAUTH_CLIENT_ID:
		'776523595883-ku17c7130dv2bknmr8d3ukk2sdnluu1f.apps.googleusercontent.com',
	GOOGLE_APP_API_KEY: 'AIzaSyCyrjpwFAJ3WDhpjjFXvF8OFMzoXnCYWiU',
	REPORT_EXPORT: {
		SCOPES: 'https://www.googleapis.com/auth/drive',
		// Discovery doc URL for APIs used by the quickstart
		DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
		API_LIB: 'https://apis.google.com/js/api.js',
		GSI_LIB: 'https://accounts.google.com/gsi/client'
	},
	POWERED_BY_ADPUSHUP_SERVICE_TIMESTAMP: 1451606400000,
	AD_UNIT_TYPE_MAPPING: {
		DISPLAY: 1,
		DOCKED: 2,
		STICKY: 3,
		// AMP: 4,
		REWARDEDADS: 5,
		INSTREAM: 6,
		CHAINEDDOCKED: 7,
		INTERSTITIAL: 8,
		INVIEW: 101
	},
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: computedProductionURL,
	INTEGRATION_BASE_URL: computedProductionURL,
	SUPPORT_EMAIL: 'support@adpushup.com',
	ADDRESS: {
		USA: '4023 Kennett Pike #52878 Wilmington, DE 19807'
	},
	DFP_WEB_SERVICE_ENDPOINT: 'https://api.adpushup.com/DfpWebService/info',
	TRANSACTION_LOG_ENDPOINT: 'https://api.adpushup.com/SetupLogWebService/log',
	REPORT_STATUS: 'https://api.adpushup.com/OpsWebService/ops?report=getNetworkImportServiceStatus',
	IE_TESTING_ENDPOINT: 'http://apdc1n-central5.eastus2.cloudapp.azure.com:8081/api/health-report',
	PROXY_ORIGIN: '//proxy.app.adpushup.com',
	TOP_URLS_API: `${reportingBaseURL}/topUrls`,
	PRODUCT_LIST_API: `${reportingBaseURL}/common/activeProducts`,
	SESSION_RPM_REPORTS_API: `${reportingBaseURL}/site/report?report_name=session_rpm_report`,
	GET_SITES_STATS_API: `${reportingBaseURL}/site/report`,
	ALL_PRODUCTS_META_API: `${reportingBaseURL}/site/list?list_name=get_all_products`,
	ACTIVE_PRODUCTS_FOR_ALL_SITES_API: `${reportingBaseURL}/common/activeProducts?isSuperUser=true`,
	ANALYTICS_API_ROOT: reportingBaseURL,
	ANALYTICS_METAINFO_BASE: metaInfoServiceBaseUrl,
	ANALYTICS_METAINFO_URL: '/meta-endpoint/metaInfo',
	REPORT_PATH: '/site/report?report_name=get_stats_by_custom',
	REPORT_PATH_XPATH: '/site/report?report_name=get_ap_stats_by_custom',
	MAB_REPORTING_API: `${reportingBaseURL}/site/mab`,
	URL_REPORT_PATH: '/url/report?report_name=url_report',
	UTM_REPORT_PATH: '/url/report?report_name=utm_report&',
	HB_REPORT_PATH: '/hb_analytics/report?report_name=GET_UI_PANEL_REPORT',
	HB_BID_CPM_STATS_REPORT_PATH: '/hb_analytics/report?report_name=GET_BID_CPM_STATS',
	DFP_LINE_ITEM_AUTOMATION_API: 'https://api.adpushup.com/DfpInventoryWebService/job',
	PAGEGROUP_LIST_API: `${reportingBaseURL}/site/list`,
	DEMO_ACCOUNT_EMAIL: 'demo@adpushup.com',
	AMP_SETTINGS_ACCESS_EMAILS: ['genieeamp@adpushup.com'],
	DEMO_REPORT_SITE_ID: 31000,
	ADPUSHUP_NETWORK_ID: 103512698, // please update this value in Client/config/config.js also
	GET_ALL_SITES_STATS_QUERY: `SELECT _site.siteId,
									_site.siteDomain as domain,
									_site.ownerEmail as accountEmail,
									_site.adNetworkSettings.revenueShare,
									_site.step as onboardingStep,
									_site.dateCreated,
									_site.apps,
									_site.dataFeedActive as activeStatus,
									_user.adNetworkSettings,
									_user.adServerSettings,
									_user.sellerId,
									_hbdc.hbcf as addedBidders
								FROM AppBucket _site
								LEFT JOIN AppBucket _user
								ON keys ('user::' || _site.ownerEmail)
								LEFT JOIN AppBucket _hbdc
								ON keys ('hbdc::' || to_string(_site.siteId))
								WHERE meta(_site).id LIKE 'site::%'
								AND meta(_user).id LIKE 'user::%';`,

	GET_ACTIVE_SITES_QUERY: `SELECT _site.siteId,
	    							_site.siteDomain as domain,
									_site.ownerEmail as accountEmail
							 FROM AppBucket _site
							 WHERE meta(_site).id LIKE 'site::%' AND _site.dataFeedActive = true;`,

	DEMO_PAGEGROUPS: [
		'HOME',
		'CALC',
		'FAQ',
		'PHONEDATABASE',
		'PHONEINFO',
		'LATESTPHONE',
		'ARTICLE',
		'DEVICE_INFO',
		'CARRIER',
		'CARRIER NETWORK',
		'CARRIER COUNTRY',
		'NEWS_ARTICLE',
		'CHECK',
		'DOWNLOAD_FIRMWARE'
	],
	GET_ACTIVE_PNP_SITE_MAPPING_QUERY: `SELECT site.siteId, pnpDoc.pnpSiteId FROM AppBucket site LEFT JOIN AppBucket pnpDoc ON KEYS ('apnp::' || to_string(site.siteId) ) WHERE META(site).id LIKE "site::%" AND META(pnpDoc).id LIKE "apnp::%" AND site.apConfigs.mergeReport = true AND site.siteId IN $1`,
	REPORT_API: {
		SELECT_PARAMS: [
			'total_requests',
			'total_impressions',
			'total_revenue',
			'report_date',
			'siteid'
		],
		DATE_FORMAT: 'YYYY-MM-DD'
	},
	SERVICES: {
		INCONTENT_ANALYSER: 'INCONTENT_ANALYSER',
		ADPTAGS: 'ADPTAGS',
		HEADER_BIDDING: 'HEADER_BIDDING',
		GDPR: 'GDPR',
		INNOVATIVE_ADS: 'INNOVATIVE_ADS',
		AP_LITE: 'AP_LITE',
		PNP_REFRESH: 'PNP_REFRESH'
	},
	INJECTION_TECHNIQUES: {
		LAYOUT: 1,
		TAG: 2,
		INNOVATIVE_AD: 3
	},
	MANUAL_ADS: {
		VARIATION: 'manual'
	},
	NETWORKS: {
		ADPTAGS: 'adpTags',
		ADSENSE: 'adsense',
		ADX: 'adx',
		MEDIANET: 'medianet',
		GENIEE: 'geniee'
	},
	TRANSACTION_SERVICES: {
		UNKNOWN: 0,
		HEADER_BIDDING: 1,
		MEDIATION: 2,
		AMP: 3,
		NEW_FORMATS: 4,
		DYNAMIC_ALLOCATION: 5,
		CONTROL_TAG: 6
	},
	REVENUE_CHANNEL: {
		UNKNOWN: 0,
		DYNAMIC_ALLOCATION: 1,
		HEADER_BIDDING: 2,
		EXCHANGE_BIDDING: 3,
		TAB_BASED: 4,
		S2S_HEADER_BIDDING: 5,
		HEADER_BIDDING_DIRECT: 6
	},
	SETUP_STATUS: {
		ACTIVE: 1,
		INACTIVE: 0
	},
	COOKIE_CONTROL_SCRIPT_TMPL:
		'!function(){var o=document.createElement("script");o.src="https://cc.cdn.civiccomputing.com/9/cookieControl-9.x.min.js",document.head.appendChild(o);var n=setInterval(function(){window.CookieControl&&(clearInterval(n),CookieControl.load(__COOKIE_CONTROL_CONFIG__))},10)}();',
	GDPR: {
		compliance: false,
		cookieControlConfig: {
			apiKey: '065eea801841ec9ad57857fa1f5248a14f27bb3e',
			iabCMP: true,
			product: 'PRO_MULTISITE',
			optionalCookies: [
				{
					name: 'information storage and access',
					label: 'Information storage and access',
					description:
						'The storage of information, or access to information that is already stored, on your device such as advertising identifiers, device identifiers, cookies, and similar technologies.',
					cookies: [],
					/* eslint-disable */
					onAccept: function() {},
					onRevoke: function() {}
					/* eslint-enable */
				},
				{
					name: 'personalisation',
					label: 'Personalisation',
					description:
						'The collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as on other websites or apps, over time. Typically, the content of the site or app is used to make inferences about your interests, which inform future selection of advertising and/or content.',
					cookies: [],
					/* eslint-disable */
					onAccept: function() {},
					onRevoke: function() {}
					/* eslint-enable */
				},
				{
					name: 'ad selection, delivery, reporting',
					label: 'Ad selection, delivery, reporting',
					description:
						'The collection of information, and combination with previously collected information, to select and deliver advertisements for you, and to measure the delivery and effectiveness of such advertisements. This includes using previously collected information about your interests to select ads, processing data about what advertisements were shown, how often they were shown, when and where they were shown, and whether you took any action related to the advertisement, including for example clicking an ad or making a purchase. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as websites or apps, over time.',
					cookies: [],
					/* eslint-disable */
					onAccept: function() {},
					onRevoke: function() {}
					/* eslint-enable */
				},
				{
					name: 'content selection, delivery, reporting',
					label: 'Content selection, delivery, reporting',
					description:
						'The collection of information, and combination with previously collected information, to select and deliver content for you, and to measure the delivery and effectiveness of such content. This includes using previously collected information about your interests to select content, processing data about what content was shown, how often or how long it was shown, when and where it was shown, and whether the you took any action related to the content, including for example clicking on content. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, such as websites or apps, over time.',
					cookies: [],
					/* eslint-disable */
					onAccept: function() {},
					onRevoke: function() {}
					/* eslint-enable */
				},
				{
					name: 'measurement',
					label: 'Measurement',
					description:
						'The collection of information about your use of the content, and combination with previously collected information, used to measure, understand, and report on your usage of the service. This does not include personalisation, the collection of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, i.e. on other service, such as websites or apps, over time.',
					cookies: [],
					/* eslint-disable */
					onAccept: function() {},
					onRevoke: function() {}
					/* eslint-enable */
				}
			],
			position: 'LEFT',
			theme: 'DARK',
			initialState: 'NOTIFY',
			branding: {
				fontColor: '#FFF',
				fontSizeTitle: '1.2em',
				fontSizeIntro: '1em',
				fontSizeHeaders: '1em',
				fontSize: '0.8em',
				backgroundColor: '#313147',
				toggleText: '#fff',
				toggleColor: '#2f2f5f',
				toggleBackground: '#111125',
				buttonIcon: null,
				buttonIconWidth: '64px',
				buttonIconHeight: '64px',
				removeIcon: false,
				removeAbout: true
			},
			excludedCountries: ['all']
		}
	},
	DEFAULT_AD_NETWORK_SETTINGS: {
		revenueShare: 10,
		adUnitTypeRevShares: {
			'6': 10
		},
		negate: ['adsense']
	},
	PROXY_DOCUMENT_DOMAIN: 'app.adpushup.com',
	apConfigDefaults: {
		heartBeatMinInterval: 3000,
		heartBeatStartDelay: 2000,
		xpathWaitTimeout: 5000,
		adpushupPercentage: 100,
		isAdPushupControlWithPartnerSSP: false
	},
	bidCpmAdjustments: {},
	amazonUAMConfigDefaults: {
		publisherId: '',
		timeOut: 3000,
		refreshTimeOut: 3000,
		isAmazonUAMActive: false
	},
	hbGlobalSettingDefaults: {
		prebidTimeout: 3000,
		prebidRefreshTimeout: 3000,
		e3FeedbackUrl: '//e3.adpushup.com/ApexWebService/feedback',
		targetAllDFP: false,
		dfpAdUnitTargeting: {
			networkId: 103512698
		},
		priceGranularity: 'DENSE',
		adpushupDfpCurrency: 'USD',
		adserverSetupCheckInterval: 1000 * 60 * 5,
		availableFormats: [
			{ name: 'Display', value: 'display' },
			{ name: 'Native', value: 'native' },
			{ name: 'Video', value: 'video' }
		],
		defaultFormats: ['display']
	},
	hbContinents: [
		{ name: 'Europe', code: 'EUR' },
		{ name: 'Oceania', code: 'OAN' },
		{ name: 'Africa', code: 'AFR' },
		{ name: 'Asia', code: 'ASA' },
		{ name: 'North America', code: 'NAA' },
		{ name: 'South America', code: 'SAA' },
		{ name: 'Middle East', code: 'MEA' }
	],
	analytics: {
		SEGMENT_APP_ID: 'vkVd688NyfGcgDhQwJSaiZofdEXvAZVQ',
		INTERCOM_ID: 'WiCwcQZTNKXyiCLQMCD7EwD2dUAPznK34rByaIt3',
		PIPEDRIVE_URL: 'https://www.adpushup.com/tech_integration/crm_scripts/callback/signup.php',
		PIPEDRIVE_SYNC_TOKEN: 'f4a90157f53a437a1f6b5c0d889b6d7db005f67e',
		pipedriveCustomFields: {
			websiteName: '5298ce43bbf31a9afa7edb2e6784b9368b55c8f3',
			dailyPageviews: '438f3045809011521f38cfe118e74943b7891627',
			websiteRevenue: '293fd8aadfb6982d31fd0b4f8f58f200f49dcb2f',
			adNetworks: '8253d39661cfb11976f8cda3342d0c3d2bd6895d',
			utmSource: '7decb93a103f97be47db094a7a53381f903280b2',
			utmMedium: '4432c8a46c4b9929937423b11acd336c47f8885a',
			utmCampaign: '1d87caef2ffc5dddf26b6548b9ddb1b1d7c97720',
			utmTerm: 'bd94cdbdfd726b04250ad6963f83c59d6284c020',
			utmName: 'ec498a8fc48461b2f3c9db550046a9875f36efc5',
			utmContent: '78fd0246cbe306230b5a27350f1ae60014531143',
			utmFirstHit: '2f15f7c3386d3c1b8f431385f19b64f4b5a99fea',
			utmFirstReferrer: 'c3daf387ef687bffc465193a6b1ac525960a1d05'
		},
		emailBlockList: ['demo@adpushup.com']
	},
	exceptions: {
		str: {
			apexServiceDataEmpty: 'Apex service data should not be empty'
		}
	},
	partners: {
		geniee: {
			email: 'geniee@adpushup.com',
			name: 'geniee',
			oauth: {
				CONSUMER_KEY: 'NDJiOGRmYTJmMGVhMzU1ZQ==',
				CONSUMER_SECRET: 'MDc0N2MzMDYzYTQ2NDk5MDUzNzQ0YjIwMTJkY2UzZDA=',
				SIGNATURE_METHOD: 'HMAC-SHA1',
				VERSION: '1.0',
				CONTENT_TYPE: 'application/json',
				URL: {
					REPORTS: 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/report/'
				}
			},
			exceptions: {
				str: {
					zonesEmpty: 'Report data should not be empty'
				}
			},
			authenticate: {
				vendorAccount: {
					publicKey: `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAz7ZZxYy5gFFW4YqQUAJm
6B5hkPejJud8YawHjEm9lUZfExjrRQsREJLl4VvYdHhs0Bp1w183dEPz7UBJQNeV
j0nNc/SE0aP2wGpAwnKkxQBk639TIzUVROtqRiRB+SjgF+hSmooz3rlnVVu+4jxw
jwAHzGMikzN7DqHmGHeHjqGv032UWG9UZF5qpxuQX7qojmO0TTvjeGJBCT5UAuoG
aC5d338Gzqve/zQvP+Tys0OreVzOhixE3FyVuyJ3XGlteCiI1hX8wfMVPT9vIijR
qzv/zQpYbR4EFAfOrxVvmx6aRKeQ7xDiPT4D4Ff70mfIO9XIc7VqEaNaBn0Ij0lt
l3fqjiF3U5wZNgIGfShTNKkY+0H0AA26mDVc5w34fHUYqSeWjTb3DZrbnmNYQUNR
/WrY25csdb/nkbidgX6QVhS+VYEXccgIwUTzgIccWXo7DoodCnAOWyYxUZCTlwdZ
Hnb4u3ND1TfRlDvkUrhJmJXt0X+2nyBMG7ozDUmfuApTT3gZLbrKsNQTHPUn0yuD
cSoBScPxy70QYICiznaZEoWoVeCQdU3tT8VTLk8ePlcsl0hGF9E9MF3E3srd8NoN
RV+BIeC6ZywS4zUfO9YjSngyhBTHr4iePwtco9oN8l979iYH5r9hI5oLV+OcYg9T
10Iyv1puWsZIAMncP7NUZJsCAwEAAQ==
-----END PUBLIC KEY-----`
				}
			}
		}
	},
	user: {
		fields: {
			default: {
				pageviewRange: '5000-15000',
				adNetworks: ['Other']
			}
		}
	},
	site: {
		mode: {
			DRAFT: 2,
			PUBLISH: 1
		}
	},
	enums: {
		priorities: {
			EXISTING_OBJECT: 'EXISTING_OBJECT',
			NEW_OBJECT: 'NEW_OBJECT'
		}
	},
	Queue: {
		SITES_TO_SYNC_ADSENSE: 'data::sitesToSyncAdsense'
	},
	errors: {
		NO_ADSENSE_ACCOUNT_CONNECTED: 'No adsense account connected',
		NO_ADS_TO_SYNC: 'No ads to sync yet',
		NO_INVITES_TO_CANCEL: 'No invites to cancel',
		USER_NOT_MANAGED: 'User is not managed'
	},
	ERROR_MESSAGES: {
		BLOB: {
			CONNECT_ERROR: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Unable to connect to Blob service',
			CREATION_SUCCESSFUL: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Successfully created a Blob',
			ALREADY_EXIST: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Blob already exists'
		},
		DIRECTORY: {
			CONNECT_ERROR: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Unable to connect to Directory service',
			CREATION_SUCCESSFUL: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Successfully created a Directory',
			ALREADY_EXIST: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Directory already exists'
		},
		FILE: {
			CONNECT_ERROR: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Unable to connect to FileUpload service',
			CREATION_SUCCESSFUL: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Successfully uploaded a File',
			ALREADY_EXIST: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: File already exists'
		},
		STORAGE_SERVICE: {
			CONNECT_ERROR: 'ADPUSHUP_APP.CLOUD_STORAGE_UPLOAD: Unable to connect to given Storage service'
		},
		RABBITMQ: {
			PUBLISHER: {
				CONNECT_ERROR: 'ADPUSHUP_APP.RABBITMQ.PUBLISHER: Unable to connect to RabbitMQ service'
			},
			CONSUMER: {
				CONNECT_ERROR: 'ADPUSHUP_APP.RABBITMQ.CONSUMER: Unable to connect to RabbitMQ service',
				EMPTY_MESSAGE: 'ADPUSHUP_APP.RABBITMQ.CONSUMER: Empty message received'
			}
		},
		MESSAGE: {
			INVALID_DATA: 'ADPUSHUP_APP.RABBITMQ.CONSUMER: Invalid Message consumer',
			CDN_SYNC_ERROR: 'Unable to sync file with cdn',
			UNSYNCED_SETUP: 'Unsynced ads in setup'
		}
	},
	SUCCESS_MESSAGES: {
		RABBITMQ: {
			PUBLISHER: {
				MESSAGE_PUBLISHED: 'ADPUSHUP_APP.RABBITMQ.PUBLISHER: Successfully published data'
			},
			CONSUMER: {
				MESSAGE_RECEIVED: 'ADPUSHUP_APP.RABBITMQ.CONSUMER: Received message data'
			}
		}
	},
	environment: {
		development: 'development',
		production: 'production',
		staging: 'staging'
	},
	onboarding: {
		steps: ['Add Site', 'Add AP code', 'Setup Passback'],
		adsTxtDocUrl:
			'https://docs.google.com/feeds/download/documents/export/Export?id=1GyE6r2IUC3B0ITGXyAtCW97vrO9T-EHAvKr2ZM-GoQM&exportFormat=txt',
		revenueLowerBound: 1000,
		initialStep: 1,
		totalSteps: 3
	},
	CDN_SYNC_MAX_ATTEMPTS: 10,
	CURRENCY_EXCHANGE: {
		API_URL: 'https://api.fixer.io/latest',
		PREBID_API_URL: 'https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json',
		PARAMETERS: {
			BASE: 'base',
			SYMBOLS: 'symbols'
		},
		CODES: {
			JPY: 'JPY',
			USD: 'USD'
		}
	},
	docKeys: {
		apTag: 'tgmr::',
		networkConfig: 'data::apNetworks',
		interactiveAds: 'fmrt::',
		user: 'user::',
		hb: 'hbdc::',
		adsTxt: 'adtx::',
		apLite: 'aplt::',
		network: 'ntwk::',
		amp: 'amtg::',
		ampScript: 'ampd::',
		instreamScript: 'inst::',
		ampAplite: 'ampaplt::',
		ampPnp: 'ampapnp::',
		requestLogger: 'reql::',
		lastRunInfoDoc: 'new:config::apnd:last-run-info',
		sizeMapppingConfig: 'data::sizeMapping',
		activeBidderAdaptersList: 'data::activeBidderAdapters',
		selectiveRolloutActiveBidderAdaptersList: 'data::selectiveRollout:activeBidderAdapters',
		ampActiveBidderAdaptersList: 'data::amp:activeBidderAdapters',
		ampSelectiveRolloutActiveBidderAdaptersList: 'data::ampSelectiveRollout:activeBidderAdapters',
		freqReports: 'freq:rprt::',
		hbaQueryFrequencyDoc: 'hbaq::',
		networkWideHBRules: 'ntwkwide::rules',
		paymentHistoryDoc: 'tplt::last3months',
		pnpRefresh: 'apnp::',
		topSitesByRevenue: 'data::topsites',
		globalClientAppConfig: 'config::client-globals',
		floorEngine: 'config::floorsEngine'
	},
	AMP_REFRESH_INTERVAL: 30,
	tagManagerInitialDoc: {
		siteId: null,
		ownerEmail: null,
		siteDomain: null,
		ads: []
	},

	networkWideRulesInitialDoc: {
		rules: []
	},

	ampAdInitialDoc: {
		siteId: null,
		ownerEmail: null,
		siteDomain: null,
		docType: 'amtg'
	},
	// for new AMP tag format
	ampAdInitialDocForNewAMP: {
		siteId: null,
		ownerEmail: null,
		siteDomain: null,
		docType: 'ampd'
	},
	INNOVATIVE_ADS_INITIAL_DOC: {
		siteId: null,
		ownerEmail: null,
		siteDomain: null,
		ads: [],
		meta: {
			pagegroups: [],
			custom: []
		}
	},
	DEFAULT_META: {
		pagegroups: [],
		custom: []
	},
	INTERACTIVE_ADS_TYPES: {
		VERTICAL: ['stickyLeft', 'stickyRight', 'docked'],
		HORIZONTAL: ['stickyTop', 'stickyBottom'],
		OTHER: ['inView']
	},
	interactiveAdsRules: {
		vertical: {
			noOfAdsAllowed: 1
		},
		horizontal: {
			noOfAdsAllowed: 1
		}
	},
	videoNetworkInfo: {
		network: 'custom',
		networkData: {
			adCode: '',
			forceByPass: true
		}
	},
	PREBID_ADAPTERS: {
		openx: 'openxBidAdapter',
		districtmDMX: 'districtmDMXBidAdapter',
		medianet: 'medianetBidAdapter',
		conversant: 'conversantBidAdapter',
		c1x: 'c1xBidAdapter',
		pulsepoint: 'pulsepointBidAdapter',
		'33across': '33acrossBidAdapter',
		ix: 'ixBidAdapter',
		oftmedia: 'appnexusBidAdapter',
		rubicon: 'rubiconBidAdapter',
		districtm: 'appnexusBidAdapter',
		criteo: 'criteoBidAdapter',
		currency: 'currency',
		pubmatic: 'pubmaticBidAdapter',
		aardvark: 'aardvarkBidAdapter',
		adyoulike: 'adyoulikeBidAdapter',
		prebidServer: 'prebidServerBidAdapter'
	},
	APP_KEYS: {
		unknown: {
			app: 'UNKNOWN',
			key: 0,
			alias: 'unknown'
		},
		layout: {
			app: 'LAYOUT',
			key: 1,
			alias: 'layout'
		},
		tag: {
			app: 'TAG',
			key: 2,
			alisa: 'tag'
		},
		hb: {
			app: 'HB',
			key: 3,
			alias: 'hb'
		},
		mediation: {
			app: 'MEDIATION',
			key: 4,
			alias: 'mediation'
		},
		ia: {
			app: 'INTERACTIVE_AD',
			key: 5,
			alias: 'ia'
		},
		amp: {
			app: 'AMP',
			key: 6,
			alias: 'amp'
		},
		adrecover: {
			app: 'AdRecover',
			key: 7,
			alias: 'adrecover'
		},
		manageadstxt: {
			app: 'Manage Ads.txt',
			key: 8,
			alias: 'manageadstxt'
		}
	},
	APP_KEY_NAME_MAPPING: {
		layout: 'Layout Editor',
		apTag: 'AP Tag',
		innovativeAds: 'Innovative Ads',
		headerBidding: 'Header Bidding',
		consentManagement: 'Consent Management'
	},
	ADS_TXT_REDIRECT_PATTERN: 'manageadstxt.com',
	GOOGLE_BOT_USER_AGENT:
		'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html).',
	DEFAULT_APP_STATUS_RESPONSE: {},
	EMAIL_REGEX: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	cronSchedule: {
		fetchMCMStatusService: '0 */12 * * *', //Every 12 hours
		activeSiteMarkingAndAdsTxtService: '20 14,2 * * *',
		adManagerSyncService: '0 */3 * * *',
		prefetchService: '*/1 * * * *', // Every 1 mins
		prefetchHBService: '*/15 * * * *', // Every 15 mins
		emailSnapshotsService: '30 7 * * *', //Run at 8:00 everyday
		paymentHistoryService: '0 0 5 * *', //At 00:00 on 5th every month
		sellersJSONService: '0 */12 * * *', // Every 12hours
		clsMonitoringService: '0 8 * * *', //Run at 8:00 everyday,
		poweredByAdpushupBannerService: '30 1 * * 0', //Runs at 1:30 Every Sunday,
		partnersPanelService: {
			Criteo: '22 13 * * *',
			Pubmatic: '24 13 * * *',
			OFT: '26 13 * * *',
			IndexExchange: '28 13 * * *',
			OpenX: '30 13 * * *'
		}
	},
	SELLERS_JSON: {
		fileConfig: {
			contact_email: 'support@adpushup.com',
			contact_address: '4023 Kennett Pike #52878 Wilmington, DE 19807',
			version: '1.0',
			identifiers: [
				{
					name: 'TAG-ID',
					value: 'b0b8ff8485794fdd'
				},
				{
					name: 'DUNS',
					value: '116775197'
				}
			],
			sellers: []
		}
	},
	USER_PAYABLE_VERIFICATION_AMOUNT: 5000,
	mandatoryAdsTxtSnippet: {
		domain: 'adpushup.com',
		relationship: 'DIRECT',
		certificationAuthorityId: 'b0b8ff8485794fdd',
		MANAGERDOMAIN: 'adpushup.com'
	},
	liveAdsTxtEntryStatus: {
		allPresent: 1,
		allMissing: 2,
		partialPresent: 3,
		noAdsTxt: 4
	},
	HEADER_BIDDING: {
		INITIAL_TIMEOUT: {
			MIN: 0,
			MAX: 10000
		},
		REFRESH_TIMEOUT: {
			MIN: 0,
			MAX: 10000
		}
	},
	AMAZON_UAM: {
		INITIAL_TIMEOUT: {
			MIN: 0,
			MAX: 10000
		},
		REFRESH_TIMEOUT: {
			MIN: 0,
			MAX: 10000
		}
	},
	DASHBOARD_QUERY_PATHS: [
		'/site/report?report_name=estimated_earning_comparison',
		'/site/report?report_name=ap_vs_baseline',
		'/site/report?report_name=site_summary',
		'/site/report?report_name=revenue_by_network',
		'/site/report?report_name=get_stats_by_custom&dimension=siteid&interval=cumulative&metrics=adpushup_page_views,adpushup_page_cpm,network_ad_ecpm,network_impressions,network_net_revenue',
		'/site/report?report_name=get_stats_by_custom&dimension=siteid&interval=daily&metrics=adpushup_page_views,adpushup_page_cpm,network_ad_ecpm,network_impressions,network_net_revenue',
		'/site/report?report_name=country_report'
	],
	ADMIN_DASHBOARD_QUERIES: [
		'/site/report?report_name=estimated_earning_comparison',
		'/site/report?report_name=ap_vs_baseline',
		'/site/report?report_name=site_summary',
		'/site/report?report_name=get_stats_by_custom&dimension=mode,error_code',
		'/site/report?report_name=top_sites',
		'/site/report?report_name=country_report&metrics=adpushup_page_views',
		'/site/report?report_name=network_report&metrics=network_net_revenue'
	],
	PREBID_BUNDLING: {
		PREBID_ADAPTERS_TO_ALWAYS_BUILD: [
			'currency',
			'schain',
			'userId',
			'unifiedIdSystem',
			'criteoIdSystem',
			'consentManagement',
			'consentManagementUsp',
			'identityLinkIdSystem'
		],
		SITE_SPECIFIC_ACTIVE_BIDDER_ADAPTERS_N1QL:
			n1qlQueryTemplates.ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE, // REPLACE __SITES_QUERY__ with [siteId]
		ACTIVE_BIDDER_ADAPTERS_N1QL: n1qlQueryTemplates.ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.CURRENT_SITES_N1QL
		),
		SELECTIVE_ROLLOUT_ACTIVE_BIDDER_ADAPTERS_N1QL: n1qlQueryTemplates.ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.SELECTIVE_ROLLOUT_SITES_N1QL
		),
		AMP_ACTIVE_BIDDER_ADAPTERS_N1QL: n1qlQueryTemplates.ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.AMP_SITES_N1QL
		),
		AMP_SELECTIVE_ROLLOUT_ACTIVE_BIDDER_ADAPTERS_N1QL: n1qlQueryTemplates.ACTIVE_BIDDER_ADAPTERS_N1QL_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.AMP_SELECTIVE_ROLLOUT_SITES_N1QL
		),
		ACTIVE_BIDDER_ADAPTERS_BY_SITE_N1QL: `SELECT DISTINCT RAW activeBidderAdapters
								FROM
									AppBucket _apNetworks
									UNNEST
										(
											ARRAY _apNetworks.[bidderKey].adapter
											FOR bidderKey
											IN (
												SELECT DISTINCT RAW activeBiddersHbdc
												FROM
													AppBucket _hbdc
													UNNEST
														(
															ARRAY hbdcBidderKey
															FOR hbdcBidderKey
															IN OBJECT_NAMES(_hbdc.hbcf)
															WHEN _hbdc.hbcf.[hbdcBidderKey].isPaused = false
															AND _hbdc.hbcf.[hbdcBidderKey].isActive = true END
														)
														AS activeBiddersHbdc
												WHERE
													meta(_hbdc).id = 'hbdc::__SITE_ID__'
											)
										WHEN
												_apNetworks.[bidderKey] IS VALUED
												AND _apNetworks.[bidderKey].isHb = true
												AND _apNetworks.[bidderKey].isActive = true
												AND _apNetworks.[bidderKey].params IS VALUED END
										)
										AS activeBidderAdapters
								WHERE
									meta(_apNetworks).id = 'data::apNetworks'
									ORDER BY activeBidderAdapters ASC;`,
		FIRST_S2S_BIDDER_SITE: n1qlQueryTemplates.FIRST_S2S_BIDDER_SITE_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.CURRENT_SITES_N1QL
		),
		SITE_SPECIFIC_FIRST_S2S_BIDDER_SITE: n1qlQueryTemplates.FIRST_S2S_BIDDER_SITE_TEMPLATE, // replace '__SITES_QUERY__' with siteId
		SELECTIVE_ROLLOUT_FIRST_S2S_BIDDER_SITE: n1qlQueryTemplates.FIRST_S2S_BIDDER_SITE_TEMPLATE.replace(
			'__SITES_QUERY__',
			n1qlQueryTemplates.SELECTIVE_ROLLOUT_SITES_N1QL
		),
		S2S_BIDDER_BY_SITE: `SELECT _hbdc.siteId
							FROM
								AppBucket _hbdc
							WHERE
								meta(_hbdc).id = 'hbdc::__SITE_ID__'
								AND ANY bidder IN OBJECT_VALUES(_hbdc.hbcf) SATISFIES bidder.isS2SActive = true END;`
	},
	SESSION_RPM: {
		SESSION_RPM_PROPS: ['session_rpm', 'user_sessions'],
		IGNORE_PROPS: ['network_net_revenue'],
		SUPPORTED_DIMENSIONS: ['country', 'siteid', 'device_type'],
		SUPPORTED_FILTERS: ['country', 'siteid', 'device_type']
	},
	HUBSPOT: {
		OPERATOR: {
			HAS_PROPERTY: 'HAS_PROPERTY',
			EQUAL: 'EQ'
		}
	},
	AUDIT_LOGS_ACTIONS: {
		HEADER_BIDDING: {
			HB_STATUS: 'HB_STATUS',
			ADD_BIDDER: 'ADD_BIDDER',
			REMOVE_BIDDER: 'REMOVE_BIDDER',
			UPDATE_BIDDER: 'UPDATE_BIDDER',
			PREBID_SETTING: 'PREBID_SETTING',
			OPTIMIZATION: 'OPTIMIZATION',
			AMAZON_UAM_SETTING: 'AMAZON_UAM_SETTING',
			REFRESH_ALL_AD_UNITS: 'REFRESH_ALL_AD_UNITS',
			UPDATE_VIDEO_AND_NATIVE_ON_AD_UNITS: 'UPDATE_VIDEO_AND_NATIVE_ON_AD_UNITS',
			UPDATE_HB_STATUS: 'UPDATE_HB_STATUS'
		},
		AMP: {
			UPDATE_AMP_ADS: 'UPDATE_AMP_ADS'
		},
		MY_SITES: {
			ADD_SITE: 'ADD_SITE',
			DELETE_SITE: 'DELETE_SITE',
			SAVE_SITE: 'SAVE_SITE',
			UPDATE_SITE_STEP: 'UPDATE_SITE_STEP',
			VERIFY_SITE: 'VERIFY_SITE'
		},
		AP_TAGS: {
			CREATE_AP_TAGS: 'CREATE_AP_TAGS',
			UPDATE_AP_TAGS: 'UPDATE_AP_TAGS',
			UPDATE_AP_CONFIG: 'UPDATE_AP_CONFIG'
		},
		INNOVATIVE_ADS: {
			CREATE_INNOVATIVE_ADS: 'CREATE_INNOVATIVE_ADS',
			UPDATE_INNOVATIVE_ADS: 'UPDATE_INNOVATIVE_ADS'
		},
		OPS_PANEL: {
			ACCOUNTS_SETTING: 'ACCOUNTS_SETTING',
			SITES_SETTING: 'SITES_SETTING',
			TOOLS: 'TOOLS'
		},
		CHANNELS: {
			CREATE_CHANNEL: 'CREATE_CHANNEL',
			UPDATE_CHANNEL: 'UPDATE_CHANNEL',
			DELETE_CHANNEL: 'DELETE_CHANNEL'
		},
		LAYOUT_EDITOR: 'LAYOUT_EDITOR',
		PAYMENT_SETTINGS: {
			PAYMENT_BALANCE: 'PAYMENT_BALANCE'
		}
	},
	FORMAT_WISE_PARAMS_PREFIX: {
		BANNER: 'apDisplay',
		VIDEO: 'apVideo',
		NATIVE: 'apNative'
	},
	FORMAT_WISE_PARAMS_REGEX: /(ap\w+)_(\w+)/,
	CORE_WEB_VITALS_API: {
		uri: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
		key: 'AIzaSyAwlPiPJIkTejgqqH01v9DmtPoPeOPXDUQ',
		headers: {
			'sec-ch-ua': '^^',
			Referer: 'https://developers.google.com/',
			'sec-ch-ua-mobile': '?0'
		}
	},
	TIPALTI_SFTP_CREDS: {
		host: 'ftp.tipalti.com',
		user: 'AdPushup',
		password: 'DVBynj73fmfg'
	},
	COUCHBASE_BUCKETS: {
		INSTREAM_APP_BUCKET: 'InstreamAppBucket'
	},
	WIDGET_AUTH_EXCLUDED_PATH: ['/site/report?report_name=peer_performance_report'],
	OUTBRAIN_DISABLED_SCRIPTS: {
		// NOTE: Please do the script name related changes in Client > Apps > OpsPanel > configs > commonConsts.js also
		ADPUSHUP_JS: 'ADPUSHUP_JS',
		AMP_DVC: 'AMP_DVC',
		AMP_TYPE_ADPUSHUP: 'AMP_TYPE_ADPUSHUP'
	},
	PNP_REFRESH_SCRIPTS: `(function () {
		var PROXY_SITE_ID = window.pnpRefresh.pnpSiteId;
		// var flag = false;
		window.pnpRefresh.adUnitState = {};
		window.pnpRefresh.insertedTags = [];
		var refreshType = window.pnpRefresh.refreshType;
		var AD_UNIT_MAPPING =
		  window.pnpRefresh.adUnits[window.adpushup.config.platform];
		if (!AD_UNIT_MAPPING) {
		  return;
		}
		var isDestroySlotLoggingEnabled = window.adpushup.isDestroySlotLoggingEnabled || false;
		var triggerDestroySlotLogging = window.adpushup.triggerDestroySlotLogging;
		var isHouseLineItemReplaceLoggingEnabled = window.adpushup.config.isHouseLineItemReplaceLoggingEnabled;
		var datadogLoggerService = adpushup.utils.sendLogsToDataDogService;
	  
		var log = window.adpushup.utils.log.bind(window.adpushup.utils);
		var checkElementInViewPercent =
		  window.adpushup.utils.checkElementInViewPercent.bind(window.adpushup.utils);
		var cssescape = window.adpushup.utils.cssescape.bind(window.adpushup.utils);
		var lineItems = window.pnpRefresh.lineItems || [];
		var blacklistedLineItems = window.pnpRefresh.blacklistedLineItems || [];
		const DEFAULT_HOUSE_LINEITEM_REPLACE_TRIGGER = 5;
  		var houseLineItemReplaceTrigger = window.pnpRefresh.houseLineItemReplaceTrigger || DEFAULT_HOUSE_LINEITEM_REPLACE_TRIGGER;
		var googletag = window.googletag || {};
		window.googletag = googletag;
		googletag.cmd = googletag.cmd || [];
	  
		googletag.cmd.push(function () {
		  function isDisplayNone(el) {
			var elComputedStyles = window.getComputedStyle(el);
			var displayNoneRegex = /none/g;
			return !!displayNoneRegex.test(elComputedStyles.display);
		  }
		  function checkElementDisplay(adId) {
			var el = document.getElementById(adId);
			if (!el) {
			  return true;
			}
			var isElDisplayNone = isDisplayNone(el);
			while (!isElDisplayNone && el.tagName !== "BODY") {
			  el = el.parentNode;
			  isElDisplayNone = isDisplayNone(el);
			}
			return isElDisplayNone;
		  }
		  function replaceSlot(slot, adUnit) {
			if (!window.pnpRefresh.hasPnPScriptInserted) {
			  window.pnpRefresh.hasPnPScriptInserted = true;
			  window.adpushup = undefined;
			  window._apPbJs = undefined;
			  window._apPbJsChunk = undefined;
			  window.adpTags = undefined;
			  (function (w, d) {
				var s = d.createElement("script");
				s.src = "//cdn.adpushup.com/" + PROXY_SITE_ID + "/adpushup.js";
				s.type = "text/javascript";
				s.async = true;
				(
				  d.getElementsByTagName("head")[0] ||
				  d.getElementsByTagName("body")[0]
				).appendChild(s);
			  })(window, document);
			}
			var existingAdElement = document.getElementById(slot.getSlotElementId());
			// collapseEmptyDivs set display none in element.style. If display none is set through a css rule, we dont want to change that. But if display: none is set in element.style, then we want to remove that
			if (existingAdElement.style.display === "none") {
			  existingAdElement.style.display = "";
			}
			if (!checkElementDisplay(slot.getSlotElementId())) {
			  log("======replacing=======adUnit", adUnit);
			  log("======replacing=======AD_UNIT_MAPPING", AD_UNIT_MAPPING);
			  var apTagId = AD_UNIT_MAPPING[adUnit].apTagId;
			  var apTagDiv = document.createElement("div");
			  apTagDiv.id = apTagId;
			  apTagDiv.classList.add("_ap_apex_ad");
			  var scriptElement = document.createElement("script");
			  scriptElement.innerText =
				"var adpushup = window.adpushup = window.adpushup || {};adpushup.que = adpushup.que || [];adpushup.que.push(function() {adpushup.triggerAd('" +
				apTagId +
				"');});";
			  apTagDiv.appendChild(scriptElement);
			  window.pnpRefresh.insertedTags.push(slot);
			  googletag.destroySlots([slot]);
			  if (isDestroySlotLoggingEnabled) {
				datadogLoggerService("PNP_DESTROY_SLOT_LOGGING", {
				  message: "slot destroyed",
				  apTagId: apTagId,
				  id: 1,
				});
			  }
			  //empty the existing ad div and append apTag to this div only, so that we do not end up affecting their layout.
			  while (existingAdElement.firstChild) {
				existingAdElement.removeChild(existingAdElement.firstChild);
			  }
			  if (existingAdElement.style.display === "none") {
				// To check if display set to none due to collapseEmptyDivs
				existingAdElement.style.display = "";
			  }
			  existingAdElement.appendChild(apTagDiv, existingAdElement);
			  delete window.pnpRefresh.adUnitState[slot.getSlotElementId()];
			  if (isDestroySlotLoggingEnabled) {
				triggerDestroySlotLogging();
				datadogLoggerService("PNP_DESTROY_SLOT_LOGGING", {
				  message: "slot injected",
				  apTagId: apTagId,
				  id: 2,
				});
			  }
			} else {
			  setTimeout(function () {
				replaceSlot(slot, adUnit);
			  }, 10000);
			}
		  }
		  // Init AdUnitState for Active View Refresh
		  function initAdUnitState(slot) {
			var divId = slot.getSlotElementId();
			var el = window.adpushup.$("#" + cssescape(divId));
			var height = el.height();
			var width = el.width();
			return {
			  code: slot.getAdUnitPath(),
			  height: height,
			  width: width,
			  rendered: true,
			  viewedOnce: false,
			  viewable: false,
			  viewablePercentage: 0,
			  gSlot: slot,
			  timestamp: false,
			  activeViewTimeoutId: false,
			  refreshTimeoutId: false,
			  readyToRefresh: false,
			  renderTimestamp: +new Date(),
			};
		  }
		  // Replace house lineitem if feature is enabled in console and house lineitem is received
		  function replaceHouseLineItem(sourceAgnosticLineItemId, adUnit, slot) {
			var shouldReplaceHouseLineItems = window.pnpRefresh.isHouseLineItemQuickReplaceEnabled;
			if(!shouldReplaceHouseLineItems) return false;
			const lineItemId = (sourceAgnosticLineItemId && sourceAgnosticLineItemId.toString()) || "";
			const houseLineItemsToReplace = window.pnpRefresh.houseLineItemsToReplace || [];
			const houseLineItemFound = houseLineItemsToReplace && houseLineItemsToReplace.includes(lineItemId);
			if(!houseLineItemFound) return false;
			log('Replacing Unit With House lineitem for: ', adUnit);
			if (isHouseLineItemReplaceLoggingEnabled) {
				datadogLoggerService("PNP_DESTROY_SLOT_LOGGING", {
				  message: "House lineitem replaced",
				  apTagId: adUnit,
				  id: 3,
				});
			  }
			setTimeout(function () {
			  replaceSlot(slot, adUnit);
			}, houseLineItemReplaceTrigger * 1000);
			return true;
		  }

		  // Active view checkinviewandrefresh
		  function checkInViewAndRefresh(slot, adUnit) {
			var divId = slot.getSlotElementId();
			var elementInView = checkElementInViewPercent("#" + cssescape(divId));
			if (elementInView) {
			  // window.pnpRefresh.adUnitState[divId] = resetadUnitState(slot);
			  replaceSlot(slot, adUnit);
			} else {
			  window.pnpRefresh.adUnitState[divId].readyToRefresh = true;
			}
		  }
	  
		  // Active view handleSettingTimeouts
		  function handleSettingTimeouts(divId, adUnit) {
			if (
			  !window.pnpRefresh.adUnitState[divId].timestamp &&
			  !window.pnpRefresh.adUnitState[divId].activeViewTimeoutId
			) {
			  log(
				"Setting Active View Timeout for ",
				window.pnpRefresh.adUnitState[divId].code
			  );
			  window.pnpRefresh.adUnitState[divId].timestamp = +new Date();
			  window.pnpRefresh.adUnitState[divId].activeViewTimeoutId = setTimeout(
				function () {
				  window.pnpRefresh.adUnitState[divId].viewedOnce = true;
				  log(
					"Viewed Once: ",
					window.pnpRefresh.adUnitState[divId].gSlot.getAdUnitPath()
				  );
				  var REFRESH_INTERVAL = window.pnpRefresh.filledInsertionTrigger;
				  var refreshAfter =
					REFRESH_INTERVAL * 1000 -
					(+new Date() -
					  window.pnpRefresh.adUnitState[divId].renderTimestamp);
				  refreshAfter = refreshAfter >= 0 ? refreshAfter : 0;
				  log("REFRESHING AFTER: " + refreshAfter / 1000 + " seconds");
				  window.pnpRefresh.adUnitState[divId].refreshTimeoutId = setTimeout(
					checkInViewAndRefresh,
					refreshAfter,
					window.pnpRefresh.adUnitState[divId].gSlot,
					adUnit
				  );
				},
				1000
			  );
			}
		  }
	  
		  // Check if the rendered slot is eligible for refresh
		  function checkRefreshEligible(slot, sourceAgnosticLineItemId, adUnit) {
			var adUnitPath = slot.getAdUnitPath();
			if (Object.keys(AD_UNIT_MAPPING).indexOf(adUnit) === -1) {
			  log("Ad Unit: " + adUnitPath + " not in our mapping");
			  return false;
			}
			if (!AD_UNIT_MAPPING[adUnit].isActive) {
			  log("Ad Unit: " + adUnitPath + " deactivated in config, stopping");
			  return false;
			}
			var lineItemId =
			  (sourceAgnosticLineItemId && sourceAgnosticLineItemId.toString()) || "";
			if (lineItemId && lineItems.length) {
			  if (lineItems.indexOf(lineItemId) === -1) {
				log(
				  "For Ad Unit: " +
					adUnitPath +
					" LineItem: " +
					lineItemId +
					" not in the whitelist, stopping"
				);
				return false;
			  }
			}
			if (blacklistedLineItems.indexOf(lineItemId) !== -1) {
			  log(
				"For Ad Unit: " +
				  adUnitPath +
				  " LineItem: " +
				  lineItemId +
				  " is in the blacklist, stopping"
			  );
			  return false;
			}
			if (window.pnpRefresh.insertedTags.indexOf(slot) !== -1) {
			  log(
				"Ad Unit: " +
				  adUnitPath +
				  " was already rendered with line item id: " +
				  sourceAgnosticLineItemId
			  );
			  return false;
			}
			log("AdUnit: " + adUnitPath + " will be refreshed");
			return true;
		  }
		  // Function which triggers the replacement for activeTab refresh
		  function triggerReplace(slot, adUnit, REFRESH_INTERVAL) {
			setTimeout(function () {
			  function checkdocfocus() {
				if (!document.hasFocus()) {
				  setTimeout(checkdocfocus, 0);
				} else {
				  replaceSlot(slot, adUnit);
				}
			  }
			  if (refreshType === "activeTab") {
				checkdocfocus();
			  } else if (refreshType === "bgRefresh") {
				replaceSlot(slot, adUnit);
			  }
			}, REFRESH_INTERVAL);
		  }
	  
		  // Get all GPT slots and process them for PNP if the publisher is loading head code with a delay
	  
		  var gptSlots = googletag.pubads().getSlots();
		  gptSlots.forEach(function (slot) {
			var slotDivId = slot.getSlotElementId();
			var slotDiv = document.getElementById(slotDivId);
			if (slotDiv && slotDiv.dataset.googleQueryId) {
			  var adUnit = slot
				.getAdUnitPath()
				.substring(slot.getAdUnitPath().lastIndexOf("/") + 1);
			  var sourceAgnosticLineItemId;
			  var slotFilled = true;
			  var REFRESH_INTERVAL = window.pnpRefresh.filledInsertionTrigger * 1000;
			  if (slot.getResponseInformation() === null) {
				log("No Fill for ad unit: " + slot.getAdUnitPath());
				REFRESH_INTERVAL = window.pnpRefresh.unfilledInsertionTrigger * 1000;
				sourceAgnosticLineItemId = null;
				slotFilled = false;
			  } else {
				sourceAgnosticLineItemId =
				  slot.getResponseInformation().sourceAgnosticLineItemId;
			  }
			  var refreshEligible = checkRefreshEligible(
				slot,
				sourceAgnosticLineItemId,
				adUnit
			  );
			  if (refreshEligible) {
				if (!slotFilled) {
				  log("e.isEmpty is true for: ", adUnit);
				  setTimeout(function () {
					replaceSlot(slot, adUnit);
				  }, window.pnpRefresh.unfilledInsertionTrigger * 1000);
				  return;
				}
				const isSlotWithHouseLineItemReplaced = replaceHouseLineItem(sourceAgnosticLineItemId, adUnit, slot);
				if(isSlotWithHouseLineItemReplaced) {
					return;
				};
				if (refreshType === "activeView") {
				  window.pnpRefresh.adUnitState[slotDivId] = initAdUnitState(slot);
				  var elementInView = checkElementInViewPercent("#" + slotDivId);
				  if (elementInView) {
					window.pnpRefresh.adUnitState[slotDivId].viewable = true;
					if (!window.pnpRefresh.adUnitState[slotDivId].viewedOnce) {
					  handleSettingTimeouts(slotDivId, adUnit);
					}
				  }
				} else {
				  triggerReplace(slot, adUnit, REFRESH_INTERVAL);
				}
			  }
			}
		  });
	  
		  // At SlotRenderEnded, if isEmpty is true then replace the slot right away otherwise create a state for adUnit which will create viewability data
		  googletag.pubads().addEventListener("slotRenderEnded", function (e) {
			log("SlotRenderEnded fired for " + e.slot.getAdUnitPath());
			var adUnit = e.slot
			  .getAdUnitPath()
			  .substring(e.slot.getAdUnitPath().lastIndexOf("/") + 1);
			var slotId = e.slot.getSlotElementId();
			var refreshEligible = checkRefreshEligible(
			  e.slot,
			  e.sourceAgnosticLineItemId,
			  adUnit
			);
			if (refreshEligible) {
			  window.adpushup.que.push(function () {
				if (e.isEmpty) {
				  log("e.isEmpty is true for: ", adUnit);
				  setTimeout(function () {
					replaceSlot(e.slot, adUnit);
				  }, window.pnpRefresh.unfilledInsertionTrigger * 1000);
				} else {
					const isSlotWithHouseLineItemReplaced = replaceHouseLineItem(e.sourceAgnosticLineItemId, adUnit, e.slot);
					if(isSlotWithHouseLineItemReplaced) {
						return;
					};
				  if (refreshType === "activeView") {
					window.pnpRefresh.adUnitState[slotId] = initAdUnitState(e.slot);
					var elementInView = checkElementInViewPercent(
					  "#" + cssescape(slotId)
					);
					if (elementInView) {
					  window.pnpRefresh.adUnitState[slotId].viewable = true;
					  if (!window.pnpRefresh.adUnitState[slotId].viewedOnce) {
						handleSettingTimeouts(slotId, adUnit);
					  }
					}
				  } else if (
					refreshType === "activeTab" ||
					refreshType === "bgRefresh"
				  ) {
					triggerReplace(
					  e.slot,
					  adUnit,
					  window.pnpRefresh.filledInsertionTrigger * 1000
					);
				  }
				}
			  });
			}
		  });
		  if (refreshType === "activeView") {
			// Everytime visibility percentage changes update it in the state and if its greater than 50% (configurable) then consider it viewable and set viewable to true otherwise false
			googletag
			  .pubads()
			  .addEventListener("slotVisibilityChanged", function (e) {
				var divId = e.slot.getSlotElementId();
				if (
				  Object.keys(window.pnpRefresh.adUnitState).indexOf(divId) !== -1
				) {
				  var adUnit = e.slot
					.getAdUnitPath()
					.substring(e.slot.getAdUnitPath().lastIndexOf("/") + 1);
				  var percentageToCheck =
					window.pnpRefresh.adUnitState[divId].height *
					  window.pnpRefresh.adUnitState[divId].width <
					242000
					  ? 50
					  : 30;
				  if (e.inViewPercentage >= percentageToCheck) {
					window.pnpRefresh.adUnitState[divId].viewable = true;
					if (window.pnpRefresh.adUnitState[divId].readyToRefresh) {
					  delete window.pnpRefresh.adUnitState[divId];
					  return replaceSlot(e.slot, adUnit);
					}
					if (!window.pnpRefresh.adUnitState[divId].viewedOnce) {
					  handleSettingTimeouts(divId, adUnit);
					}
				  } else {
					window.pnpRefresh.adUnitState[divId].viewable = false;
					window.pnpRefresh.adUnitState[divId].timestamp = false;
					if (window.pnpRefresh.adUnitState[divId].activeViewTimeoutId) {
					  clearTimeout(
						window.pnpRefresh.adUnitState[divId].activeViewTimeoutId
					  );
					  window.pnpRefresh.adUnitState[
						divId
					  ].activeViewTimeoutId = false;
					}
				  }
				  window.pnpRefresh.adUnitState[divId].viewablePercentage =
					e.inViewPercentage;
				}
			  });
		  }
		});
	  })();
	  `,
	AMP_PNP_REFRESH_SCRIPTS: `
	(function () {
		var LOG_EVENT = 'AMP_PNP_SETUP';
		var sendDataToLoggerService = window.adpushup.utils.sendDataToLoggerService.bind(
			window.adpushup.utils
		);
		
		var adpConfig = window.adpushup.config || {};

		var sendLogToApLogger = function (subEvent, data) {
			var logData = {
				packetId: adpConfig.packetId,
				subEvent
			};
			Object.assign(logData, data);
			sendDataToLoggerService(LOG_EVENT, logData);
		};
		
		var sendAmpPnpDebugLogToApLogger = function(subEvent, data) {
			if (adpConfig.debugAmpPnp) {
				sendLogToApLogger(subEvent, data);
			}
		}
		
		sendAmpPnpDebugLogToApLogger('PNP_TEMPLATE_INIT')
	
		var PROXY_SITE_ID = window.pnpRefresh.pnpSiteId;
		// var flag = false;
		window.pnpRefresh.adUnitState = {};
		window.pnpRefresh.insertedTags = [];
		var AD_UNIT_MAPPING = window.pnpRefresh.adUnits[window.adpushup.config.platform];
		var log = window.adpushup.utils.log.bind(window.adpushup.utils);
		var checkElementInViewPercent = window.adpushup.utils.isAmpSlotInView.bind(window.adpushup.utils);
		var lineItems = window.pnpRefresh.lineItems || [];
		var blacklistedLineItems = window.pnpRefresh.blacklistedLineItems || [];
		var firstImpressionRefreshLineItems = window.pnpRefresh.firstImpressionRefreshLineItems || [];
		var forceRefreshFirstImpression = !!window.pnpRefresh.forceRefreshFirstImpression;
		const refreshTypes = {
			BACKGROUND: 'bgRefresh',
			ACTIVE_TAB: 'activeTab',
			ACTIVE_VIEW: 'activeView'
		}
	
		var googletag = (window.googletag = window.googletag || {});
		googletag.cmd = googletag.cmd || [];
		googletag.cmd.push(function () {
			try {
				function isDisplayNone(el) {
					var elComputedStyles = window.getComputedStyle(el);
					var displayNoneRegex = /none/g;
					return !!displayNoneRegex.test(elComputedStyles.display);
				}
				function checkElementDisplay(adId) {
					var el = document.getElementById(adId);
					if (!el) {
						return true;
					}
					var isElDisplayNone = isDisplayNone(el);
					while (!isElDisplayNone && el.tagName !== 'BODY') {
						el = el.parentNode;
						isElDisplayNone = isDisplayNone(el);
					}
					return isElDisplayNone;
				}
	
				function isFirstImpressionRefreshEligible(lineItem) {
					return firstImpressionRefreshLineItems.indexOf(lineItem) > -1;
				}
	
				function refreshOnFirstImpression(slot, lineitem) {
					log('Lineitem: ' + lineitem + ' not in whitelist and forceRefreshFirstImpression is on');
					log('Force Refreshing the first impression ' + slot.getSlotElementId());
					googletag.pubads().refresh([slot]);
				}
	
				function refreshSlot(slot, adUnit) {
					var lineItem = window.pnpRefresh.adUnitState[slot.getSlotElementId()].lineItemId;
					if (lineItems.indexOf(String(lineItem)) === -1 && forceRefreshFirstImpression) {
						refreshOnFirstImpression(slot, lineItem);
					} else if (isFirstImpressionRefreshEligible(String(lineItem))) {
						refreshOnFirstImpression(slot, lineItem);
					} else {
						replaceSlot(slot, adUnit);
					}
				}
	
				function replaceSlot(slot, adUnit) {
					try {
						if (!window.pnpRefresh.hasPnPScriptInserted) {
							window.pnpRefresh.hasPnPScriptInserted = true;
							window.adpushup = undefined;
							window._apPbJs = undefined;
							window._apPbJsChunk = undefined;
							window.adpTags = undefined;
							(function (w, d) {
								var s = d.createElement('script');
								s.src = '//cdn.adpushup.com/' + PROXY_SITE_ID + '/ap-amp.js';
								s.type = 'text/javascript';
								s.async = true;
								(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(
									s
								);
							})(window, document);
						}
						var existingAdElement = document.getElementById(slot.getSlotElementId());
						if (!checkElementDisplay(slot.getSlotElementId())) {
							log('======replacing=======adUnit', adUnit);
							log('======replacing=======AD_UNIT_MAPPING', AD_UNIT_MAPPING);
							var apTagId = AD_UNIT_MAPPING[adUnit].apTagId;
							var apTagDiv = document.createElement('div');
							apTagDiv.id = apTagId;
							apTagDiv.classList.add('_ap_apex_ad');
							var scriptElement = document.createElement('script');
							scriptElement.innerText =
								"var adpushup = window.adpushup = window.adpushup || {};adpushup.que = adpushup.que || [];adpushup.que.push(function() {adpushup.triggerAd('" +
								apTagId +
								"');});";
							apTagDiv.appendChild(scriptElement);
							window.pnpRefresh.insertedTags.push(slot);
							googletag.destroySlots([slot]);
							//empty the existing ad div and append apTag to this div only, so that we do not end up affecting their layout.
							while (existingAdElement.firstChild) {
								existingAdElement.removeChild(existingAdElement.firstChild);
							}
							if (existingAdElement.style.display === 'none') {
								// To check if display set to none due to collapseEmptyDivs
								existingAdElement.style.display = '';
							}
							existingAdElement.appendChild(apTagDiv, existingAdElement);
							delete window.pnpRefresh.adUnitState[slot.getSlotElementId()];
							sendAmpPnpDebugLogToApLogger('REPLACED_SLOT', {
								adUnit: adUnit,
								apTagId: apTagId
							});
						} else {
							setTimeout(function () {
								//console.log("Checking, " + adUnit);
								// collapseEmptyDivs set display none in element.style. If display none is set through a css rule, we dont want to change that. But if display: none is set in element.style, then we want to remove that
								if (existingAdElement.style.display === 'none') {
									existingAdElement.style.display = '';
								}
								replaceSlot(slot, adUnit);
							}, 10000);
						}
					} catch (error) {
						sendLogToApLogger('ERROR_REPLACE_SLOT', error);
					}
				}
				// Init AdUnitState for Active View Refresh
				function initAdUnitState(slot, lineItemId) {
					var divId = slot.getSlotElementId();
					var el = window.adpushup.$('#' + divId);
					var height = el.height();
					var width = el.width();
					return {
						code: slot.getAdUnitPath(),
						height: height,
						width: width,
						rendered: true,
						viewedOnce: false,
						viewable: false,
						viewablePercentage: 0,
						gSlot: slot,
						timestamp: false,
						activeViewTimeoutId: false,
						refreshTimeoutId: false,
						readyToRefresh: false,
						renderTimestamp: +new Date(),
						lineItemId: lineItemId
					};
				}

				function checkAndReplaceRefreshType(){
					if(window.pnpRefresh.refreshType === refreshTypes.ACTIVE_VIEW){
						return refreshTypes.ACTIVE_TAB;
					}
					return window.pnpRefresh.refreshType;
				}
	
				// Active view handleSettingTimeouts
				function handleSettingTimeouts(divId, adUnit) {
					if (
						!window.pnpRefresh.adUnitState[divId].timestamp &&
						!window.pnpRefresh.adUnitState[divId].activeViewTimeoutId &&
						!window.pnpRefresh.adUnitState[divId].refreshTimeoutId
					) {
						log('Setting Active View Timeout for ', window.pnpRefresh.adUnitState[divId].code);
						window.pnpRefresh.adUnitState[divId].timestamp = +new Date();
						window.pnpRefresh.adUnitState[divId].activeViewTimeoutId = setTimeout(function () {
							window.pnpRefresh.adUnitState[divId].viewedOnce = true;
							log('Viewed Once: ', window.pnpRefresh.adUnitState[divId].gSlot.getAdUnitPath());
							let adUnitObject = AD_UNIT_MAPPING[adUnit];
							if (
								adUnitObject &&
								adUnitObject.refreshType &&
								adUnitObject.changeReplaceTypeOnImpressionViewed
							) {
								adUnitObject.refreshType = checkAndReplaceRefreshType();
								log('Replaced Active view with', adUnitObject.refreshType, adUnit);
							}
							var REFRESH_INTERVAL = window.pnpRefresh.filledInsertionTrigger;
							var refreshAfter =
								REFRESH_INTERVAL * 1000 -
								(+new Date() - window.pnpRefresh.adUnitState[divId].renderTimestamp);
							refreshAfter = refreshAfter >= 0 ? refreshAfter : 0;
							log('REFRESHING AFTER: ' + refreshAfter / 1000 + ' seconds');
							window.pnpRefresh.adUnitState[divId].refreshTimeoutId = setTimeout(
								triggerReplace,
								refreshAfter,
								window.pnpRefresh.adUnitState[divId].gSlot,
								adUnit
							);
						}, 2000);
					}
				}
	
				// Check if the rendered slot is eligible for refresh
				function checkRefreshEligible(slot, sourceAgnosticLineItemId, adUnit) {
					try {
						var adUnitPath = slot.getAdUnitPath();
						if (Object.keys(AD_UNIT_MAPPING).indexOf(adUnit) === -1) {
							log('Ad Unit: ' + adUnitPath + ' not in our mapping');
							return false;
						}
						if (!AD_UNIT_MAPPING[adUnit].isActive) {
							log('Ad Unit: ' + adUnitPath + ' deactivated in config, stopping');
							return false;
						}
						var lineItemId = (sourceAgnosticLineItemId && sourceAgnosticLineItemId.toString()) || '';
						if (lineItemId && lineItems.length) {
							if (
								lineItems.indexOf(lineItemId) === -1 && !forceRefreshFirstImpression
							) {
								log(
									'For Ad Unit: ' +
										adUnitPath +
										' LineItem: ' +
										lineItemId +
										' not in the whitelist, and forceRefreshFirstImpression not enabled, stopping'
								);
								return false;
							}
						}
						if (blacklistedLineItems.indexOf(lineItemId) !== -1) {
							log(
								'For Ad Unit: ' +
									adUnitPath +
									' LineItem: ' +
									lineItemId +
									' is in the blacklist, stopping'
							);
							return false;
						}
						if (window.pnpRefresh.insertedTags.indexOf(slot) !== -1) {
							log(
								'Ad Unit: ' +
									adUnitPath +
									' was already rendered with line item id: ' +
									sourceAgnosticLineItemId
							);
							return false;
						}
						log('AdUnit: ' + adUnitPath + ' will be refreshed');
						return true;
					} catch (error) {
						sendLogToApLogger('ERROR_IN_CHECK_REFRESH', error);
					}
				}
	
				function checkDocInFocus() {
					return document.visibilityState == 'visible';
				}
	
				function checkRefreshType(adUnit) {
					let adUnitObject = AD_UNIT_MAPPING[adUnit];
					return (
						(adUnitObject && adUnitObject.refreshType) ||
						(window.pnpRefresh && window.pnpRefresh.refreshType)
					);
				}
	
				function triggerReplace(slot, adUnit, REFRESH_INTERVAL = 0) {
					var divId = slot.getSlotElementId();
					var adUnitState = window.pnpRefresh.adUnitState[divId];
					adUnitState.readyToRefresh = true;
					var refreshType = checkRefreshType(adUnit);
					switch (refreshType) {
						case 'bgRefresh':
							adUnitState.refreshTimeoutId = setTimeout(function () {
								refreshSlot(slot, adUnit);
								log(adUnit, 'Background Replacement Turned On, Replaced at', new Date());
							}, REFRESH_INTERVAL);
							break;
						case 'activeTab':
							adUnitState.refreshTimeoutId = setTimeout(function () {
								if (!checkDocInFocus()) {
									return;
								}
								refreshSlot(slot, adUnit);
								log(adUnit, 'Active Tab Replacement Turned On, Replaced at', new Date());
							}, REFRESH_INTERVAL);
							break;
						default:
							if (checkElementInViewPercent()) {
								return refreshSlot(slot, adUnit);
							}
					}
				}
	
				function getRefreshAfterTiming(adUnitState, adUnit) {
					var REFRESH_INTERVAL = window.pnpRefresh.filledInsertionTrigger;
					let refreshAfter = REFRESH_INTERVAL * 1000 - (+new Date() - adUnitState.renderTimestamp);
					refreshAfter = refreshAfter >= 0 ? refreshAfter : 0;
					log(adUnit, 'trigger Set for replacement after', refreshAfter);
					return refreshAfter;
				}
	
				function handleRefresh(divId, adUnit) {
					if (Object.keys(window.pnpRefresh.adUnitState).indexOf(divId) !== -1) {
						var refreshType = checkRefreshType(adUnit);
						log('Refresh Type on Adunit', refreshType, adUnit);
						var adUnitState = window.pnpRefresh.adUnitState[divId];
						var slot = adUnitState.gSlot;
						let refreshAfter;
	
						switch (refreshType) {
							case 'bgRefresh':
								if (adUnitState.refreshTimeoutId) return;
								refreshAfter = getRefreshAfterTiming(adUnitState, adUnit);
								triggerReplace(slot, adUnit, refreshAfter);
								break;
							case 'activeTab':
								if (adUnitState.refreshTimeoutId) return;
								if (!checkDocInFocus()) {
									return;
								}
								refreshAfter = getRefreshAfterTiming(adUnitState, adUnit);
								triggerReplace(slot, adUnit, refreshAfter);
								break;
							default:
								if (adUnitState.readyToRefresh) {
									triggerReplace(slot, adUnit);
									return;
								}
								// Active View Replacement
								if (checkElementInViewPercent()) {
									log('pnp slot inview ' + divId);
									adUnitState.viewable = true;
									if (!adUnitState.viewedOnce) {
										handleSettingTimeouts(divId, adUnit);
									}
								} else {
									log('pnp slot clearing viewable timeout ' + divId);
									adUnitState.viewable = false;
									adUnitState.timestamp = false;
									if (adUnitState.activeViewTimeoutId) {
										clearTimeout(adUnitState.activeViewTimeoutId);
										adUnitState.activeViewTimeoutId = false;
									}
								}
						}
					}
				}
				// At SlotRenderEnded, if isEmpty is true then replace the slot right away otherwise create a state for adUnit which will create viewability data
				googletag.pubads().addEventListener('slotRenderEnded', function (e) {
					log('SlotRenderEnded fired for ' + e.slot.getAdUnitPath());
					sendAmpPnpDebugLogToApLogger('EVENT_SLOT_RENDER_ENDED', {
						adUnit: e.slot.getAdUnitPath()
					});
					var adUnitPath = e.slot.getAdUnitPath();
					var adUnit;
					if (window.pnpRefresh.checkFullAdUnitCode) {
						adUnit = adUnitPath.substring(adUnitPath.indexOf('/',1) + 1);
					} else {
						adUnit = adUnitPath.substring(adUnitPath.lastIndexOf('/') + 1);
					}
					var slotId = e.slot.getSlotElementId();
					var refreshEligible = checkRefreshEligible(e.slot, e.sourceAgnosticLineItemId, adUnit);
					if (refreshEligible) {
						sendAmpPnpDebugLogToApLogger('REFRESH_ELIGIBLE', {
							adUnit: e.slot.getAdUnitPath()
						});
						log('Refresh eligible for adunit', adUnit);
						window.adpushup.que.push(function () {
							if (e.isEmpty) {
								log('e.isEmpty is true for: ', adUnit);
								setTimeout(function () {
									replaceSlot(e.slot, adUnit);
								}, window.pnpRefresh.unfilledInsertionTrigger * 1000);
							} else {
								// Passing lineItemId to Ad Unit state to check for forceRefreshFirstImpression
								window.pnpRefresh.adUnitState[slotId] = initAdUnitState(
									e.slot,
									e.sourceAgnosticLineItemId
								);
	
								handleRefresh(slotId, adUnit);
	
								window.adpushup.$(window).on('visibilitychange', () => {
									if (document.visibilityState === 'visible') {
										handleRefresh(slotId, adUnit);
									}
								});
	
								window.addEventListener(
									'message',
									window.adpushup.utils.ampCallHandlerIfSafeFramePostMessage.bind(
										null,
										handleRefresh.bind(null, slotId, adUnit, e.slot)
									)
								);
							}
						});
					} else {
						sendAmpPnpDebugLogToApLogger('REFRESH_UNELIGIBLE', {
							adUnit: e.slot.getAdUnitPath()
						});
						log('Refresh not eligible for adunit', adUnit);
					}
				});
			} catch (error) {
				sendLogToApLogger('ERROR_GOOGLE_CMD', error);
			}
		});
	})();	
	`,
	SCRIPT_TYPE: {
		ADPUSHUPJS: 'adpushupjs',
		DVC: 'dvc',
		AMP: 'ampScript'
	},
	URL_REPORTING_REPORT_CONFIG: 'config::rprt:urlReporting',
	HB_ANALYTICS_REPORT_CONFIG: 'config::rprt:hbAnalytics',
	OPERATIONS_REPORT_CONFIG: 'config::rprt:operations',
	USER_REPORT_CONFIG: 'config::rprt:user',
	URL_REPORTING_PRODUCT: 'url-reporting',
	HB_ANALYTICS_PRODUCT: 'hb-analytics',
	HTTP_RESPONSE_MESSAGES:{
		INTERNAL_SERVER_ERROR:"Internal Server Error!",
		NO_AD_UNITS_FOUND:"No ad units found!",
		AD_UNITS_UPDATED:"Ad Units Updated",
		SITE_NOT_FOUND:"Site not found!",
		AD_UNITS_CREATED:"Ad Units Created!",
		UPDATE_FAILED_NO_UNITS:'Update failed due to some ad units are not present!',
		UPDATE_FAILED_DUPLICATE_UNITS:'Update failed due to duplicate ad units!'
	},
	AUDIT_LOG_MESSAGES:{
		ACTION:{
			SITE_API_CALL:"Sites API Call",
			SITE_SETTINGS_AP_LITE:"Sites Setting AP-Lite"
		}
	},
	AUDIT_LOG_TYPES:{
		SITE:"site"
	},
	AP_LITE_AD_UNIT_DEFAULT_VALUES:{
		HEADER_BIDDING:true,
		REFRESH:false,
		FORMATS:["video","display"],
		REFRESH_INTERVAL:30,
		ACTIVE:true,
	}
};
