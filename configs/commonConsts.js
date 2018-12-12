module.exports = {
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: 'http://console.adpushup.com',
	DFP_WEB_SERVICE_ENDPOINT: 'http://staging.adpushup.com/DfpWebService/info',
	TRANSACTION_LOG_ENDPOINT: 'http://staging.adpushup.com/SetupLogWebService/log',
	PROXY_ORIGIN: '//proxy.app.adpushup.com',
	DEMO_ACCOUNT_EMAIL: 'demo@adpushup.com',
	DEMO_REPORT_SITE_ID: 31764,
	DEMO_PAGEGROUPS: ['HOME', 'IMAGE', 'POST', 'PHPBB3', 'NEW', 'CATEGORY'],
	REPORT_API: {
		SELECT_PARAMS: ['total_requests', 'total_impressions', 'total_revenue', 'report_date', 'siteid'],
		DATE_FORMAT: 'YYYY-MM-DD'
	},
	SERVICES: {
		INCONTENT_ANALYSER: 'INCONTENT_ANALYSER',
		ADPTAGS: 'ADPTAGS',
		HEADER_BIDDING: 'HEADER_BIDDING',
		GDPR: 'GDPR'
	},
	INJECTION_TECHNIQUES: {
		LAYOUT: 1,
		TAG: 2
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
		DYNAMIC_ALLOCATION: 5
	},
	SETUP_STATUS: {
		ACTIVE: 1,
		INACTIVE: 0
	},
	COOKIE_CONTROL_SCRIPT_TMPL:
		'!function(){var o=document.createElement("script");o.src="https://cc.cdn.civiccomputing.com/8.0/cookieControl-8.0.min.js",document.head.appendChild(o);var n=setInterval(function(){window.CookieControl&&(clearInterval(n),CookieControl.load(__COOKIE_CONTROL_CONFIG__))},10)}();',
	GDPR: {
		compliance: false,
		cookieControlConfig: {
			apiKey: '065eea801841ec9ad57857fa1f5248a14f27bb3e',
			product: 'PRO_MULTISITE',
			optionalCookies: [
				{
					name: 'information storage and access',
					label: 'Information storage and access',
					description:
						'The storage of information, or access to information that is already stored, on your device such as advertising identifiers, device identifiers, cookies, and similar technologies.',
					cookies: [],
					onAccept: function() {},
					onRevoke: function() {}
				},
				{
					name: 'personalisation',
					label: 'Personalisation',
					description:
						'The collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as on other websites or apps, over time. Typically, the content of the site or app is used to make inferences about your interests, which inform future selection of advertising and/or content.',
					cookies: [],
					onAccept: function() {},
					onRevoke: function() {}
				},
				{
					name: 'ad selection, delivery, reporting',
					label: 'Ad selection, delivery, reporting',
					description:
						'The collection of information, and combination with previously collected information, to select and deliver advertisements for you, and to measure the delivery and effectiveness of such advertisements. This includes using previously collected information about your interests to select ads, processing data about what advertisements were shown, how often they were shown, when and where they were shown, and whether you took any action related to the advertisement, including for example clicking an ad or making a purchase. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as websites or apps, over time.',
					cookies: [],
					onAccept: function() {},
					onRevoke: function() {}
				},
				{
					name: 'content selection, delivery, reporting',
					label: 'Content selection, delivery, reporting',
					description:
						'The collection of information, and combination with previously collected information, to select and deliver content for you, and to measure the delivery and effectiveness of such content. This includes using previously collected information about your interests to select content, processing data about what content was shown, how often or how long it was shown, when and where it was shown, and whether the you took any action related to the content, including for example clicking on content. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, such as websites or apps, over time.',
					cookies: [],
					onAccept: function() {},
					onRevoke: function() {}
				},
				{
					name: 'measurement',
					label: 'Measurement',
					description:
						'The collection of information about your use of the content, and combination with previously collected information, used to measure, understand, and report on your usage of the service. This does not include personalisation, the collection of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, i.e. on other service, such as websites or apps, over time.',
					cookies: [],
					onAccept: function() {},
					onRevoke: function() {}
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
	hbGlobalSettingDefaults: {
		prebidTimeout: 5000,
		e3FeedbackUrl: '//e3.adpushup.com/ApexWebService/feedback',
		targetAllDFP: false,
		dfpAdUnitTargeting: {
			networkId: 103512698
		}
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
	password: {
		MASTER: 'fe4720b8bcdedb3cc47490015b0ab050',
		IMPERSONATE: 'djasgjhd6876**hhkhkjhkh4ghg'
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
		production: 'production'
	},
	onboarding: {
		steps: ['Add Site', 'Add AP code', 'Setup Passback'],
		revenueLowerBound: 1000,
		initialStep: 1,
		totalSteps: 3
	},
	CDN_SYNC_MAX_ATTEMPTS: 10,
	CURRENCY_EXCHANGE: {
		API_URL: 'https://api.fixer.io/latest',
		PARAMETERS: {
			BASE: 'base',
			SYMBOLS: 'symbols'
		},
		CODES: {
			JPY: 'JPY',
			USD: 'USD'
		}
	},
	dummy: 'test',
	docKeys: {
		tagManager: 'tgmr::'
	},
	tagManagerInitialDoc: {
		siteId: null,
		ownerEmail: null,
		siteDomain: null,
		ads: []
	},
	videoNetworkInfo: {
		network: 'custom',
		networkData: {
			adCode: '',
			forceByPass: true
		}
	}
};
