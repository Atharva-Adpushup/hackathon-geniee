module.exports = {
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: 'http://console.adpushup.com',
	PROXY_ORIGIN: 'http://proxy.app.adpushup.com',
	DEMO_ACCOUNT_EMAIL: 'demo@adpushup.com',
	DEMO_REPORT_SITE_ID: 28822,
	DEMO_PAGEGROUPS: ['MIC', 'WEBCAM'],
	REPORT_API: {
		SELECT_PARAMS: ['total_requests', 'total_impressions', 'total_revenue', 'report_date', 'siteid'],
		DATE_FORMAT: 'YYYY-MM-DD'
	},
	DEFAULT_AD_NETWORK_SETTINGS: {
		revenueShare: 10,
		negate: [
			"adsense"
		]
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
		}
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
	}
};
