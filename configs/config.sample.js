module.exports = {
	environment: {
		// change to environment
		HOST_PORT: 8080,
		HOST_ENV: 'development',
		LOGS_DIR: 'logs',
		OPS_HOST_PORT: 8443
	},
	dfpNetworkCodes: {
		GENIEE: '11586562'
	},
	analytics: {
		pipedriveActivated: false,
		manualTagsActivated: false
	},
	reporting: {
		activated: true
	},
	services: {
		adStatsSyncService: {
			daysForUpdate: 365
		}
	},
	serverDensity: {
		host: 'staging.adpushup.com'
	},
	cacheFlyFtp: {
		HOST: '127.0.0.1',
		USERNAME: 'anonymous'
	},
	elasticServer: {
		host: 'localhost:9200',
		log: 'trace',
		requestTimeout: 3500 // in ms
	},
	auditLogElasticServer: {
		host: 'http://127.0.0.1:8083/auditLog'
	},
	hubSpotService: {
		host: 'http://localhost:8181'
	},
	googleOauth: {
		OAUTH_CLIENT_ID: 'GOOGLE CLIENT ID',
		OAUTH_CLIENT_SECRET: 'GOOGLE CLIENT SECRET',
		OAUTH_CALLBACK: 'http://localhost:8080/api/user/oauth2callback',
		OAUTH_SCOPE: [
			'https://www.googleapis.com/auth/adsense.readonly',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/adsensehost',
			'https://www.googleapis.com/auth/dfp'
		].join(' ')
	},
	ADPUSHUP_GAM: {
		REFRESH_TOKEN: 'AP GAM REFRESH TOKEN',
		ACTIVE_DFP_NETWORK: '103512698',
		ACTIVE_DFP_PARENTID: '102512818'
	},
	// local
	redisEnvironment: {
		REDIS_PORT: 6379,
		REDIS_HOST: '127.0.0.1'
	},
	couchBase: {
		HOST: '127.0.0.1',
		USERNAME: 'Admin',
		PASSWORD: 'CB PASSWORD',
		DEFAULT_BUCKET: 'AppBucket',
		DEFAULT_BUCKET_PASSWORD: 'CB PASSWORD',
		DEFAULT_USER_NAME: 'Admin',
		DEFAULT_USER_PASSWORD: 'CB PASSWORD',
		SESSION_SECRET: 'ADPUSHUP_SESSION_KEY'
	},
	globalBucket: {
		HOST: '127.0.0.1',
		USERNAME: 'admin',
		PASSWORD: 'CB PASSWORD',
		DEFAULT_BUCKET: 'apGlobalBucket',
		DEFAULT_BUCKET_PASSWORD: 'CB PASSWORD'
	},
	email: {
		MAIL_FROM: 'support@adpushup.com',
		MAIL_FROM_NAME: 'AdPushup Mailer',
		SMTP_SERVER: 'email-smtp.us-west-2.amazonaws.com',
		SMTP_USERNAME: 'wrong',
		SMTP_PASSWORD: 'wrong'
	},
	PARTNERS_PANEL_INTEGRATION: {
		ANOMALY_THRESHOLD: 10,
		ANOMALY_THRESHOLD_IN_PER: 5,
		AUTH_ERROR: 'AUTH_ERROR',
		CRITEO: {
			PARTNER_NAME: 'Criteo',
			NETWORK_ID: 20,
			DOMAIN_FIELD_NAME: 'Domain',
			REVENUE_FIELD: 'Revenue',
			ENDPOINT: 'https://pmc.criteo.com/api/stats',
			AUTH_PARAMS: {
				TOKEN: 'D152A218-5DE9-4834-91F0-95542119D520'
			}
		},
		PUBMATIC: {
			PARTNER_NAME: 'Pubmatic',
			NETWORK_ID: 28,
			DOMAIN_FIELD_NAME: 'site_name',
			REVENUE_FIELD: 'netRevenue',
			ENDPOINT: {
				API_ENDPOINT: 'http://api.pubmatic.com/v1',
				PUBLISHER_ID: '158261'
			},
			AUTH_PARAMS: {
				userName: 'sharad.yadav@adpushup.com',
				password: 'PcCkgS9Huxbh4WN',
				apiProduct: 'PUBLISHER'
			}
		},
		OFT: {
			PARTNER_NAME: 'OFT/152Media',
			NETWORK_ID: 11,
			DOMAIN_FIELD_NAME: 'site_name',
			REVENUE_FIELD: 'publisher_revenue',
			ENDPOINT: {
				API_ENDPOINT: 'https://api.appnexus.com'
			},
			AUTH_PARAMS: {
				auth: {
					username: 'adpushup152ns',
					password: '2021@Adpushup'
				}
			}
		},
		INDEX_EXCHANGE: {
			PARTNER_NAME: 'IndexExchange',
			NETWORK_ID: 21,
			DOMAIN_FIELD_NAME: 'domain',
			REVENUE_FIELD: 'publisher_payment',
			ENDPOINT: {
				AUTH_ENDPOINT: 'https://app.indexexchange.com/api/authentication/v1/login',
				API_ENDPOINT: 'https://app.indexexchange.com/api/reporting/agg/v1'
			},
			REPORT_ID: 340267,
			AUTH_PARAMS: {
				username: 'dikshant.joshi@adpushup.com',
				password: 'y:ZwJqj56_jMZKF'
			}
		},
		OPENX: {
			PARTNER_NAME: 'OpenX',
			NETWORK_ID: 10,
			DOMAIN_FIELD_NAME: 'publisherSiteName',
			REVENUE_FIELD: 'marketPublisherRevenueInPCoin',
			CONSUMER: {
				key: '3886c1427947cac75c7034db82f590d01bc826d6',
				secret: 'd457b1ff100015ca3a7dd1d1ed7972aa455231a9'
			},
			ENDPOINT: {
				API_ENDPOINT: 'http://openxcorporate-ui3.openxenterprise.com',
				OAUTH_ENDPOINT_INITIATE: 'https://sso.openx.com/api/index/initiate',
				OAUTH_ENDPOINT_PROCESS: 'https://sso.openx.com/login/process',
				OAUTH_ENDPOINT_TOKEN: 'https://sso.openx.com/api/index/token'
			},
			AUTH_PARAMS: {
				EMAIL: 'ankit.bharthwal@adpushup.com',
				PASSWORD: 'Openx@123$%^'
			}
		},
		TIMEZONE_OFFSET: {
			PRODUCTION: {
				PDT: 8,
				PST: 7
			},
			STAGING: {
				PDT: 8,
				PST: 7
			}
		}
	},
	ops: {
		couchBaseBuckets: {
			apStatsBucket: {
				HOST: '127.0.0.1',
				USERNAME: 'administrator',
				PASSWORD: 'CB PASS',
				BUCKET_PASSWORD: 'BUCKET PASS'
			},
			apGlobalBucket: {
				HOST: '10.1.1.7',
				USERNAME: 'administrator',
				PASSWORD: 'CB PASS',
				BUCKET_NAME: 'apGlobalBucket',
				BUCKET_PASSWORD: 'BUCKET PASS'
			}
		},
		auth: {
			username: 'ops.adpushup.com username',
			pass: 'ops.adpushup.com pass'
		},
		salt: 'Ads txt salt',
		masterPswMd5: 'master password md5'
	},
	jwt: {
		salt: 'JWT salt'
	},
	RABBITMQ: {
		// localhost
		PUBLISHER_API: 'http://localhost:8087/publish',
		PUBLISHER_API_BULK: 'http://localhost:8087/publishBulk',

		// localhost
		URL: 'amqp://guest:guest@localhost:5672',
		CDN_ORIGIN: {
			NAME_IN_QUEUE_PUBLISHER_SERVICE: 'CDN_ORIGIN',
			EXCHANGE: {
				name: 'cdnOrigin',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'cdnOrigin',
				options: { durable: true }
			}
		},
		GENIEE_AD_SYNC: {
			EXCHANGE: {
				name: 'genieeZoneSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUES: {
				GENIEE_AD_SYNC: {
					name: 'genieeZoneSync',
					options: { durable: true }
				}
			}
		},
		CDN_SYNC: {
			EXCHANGE: {
				name: 'consoleCdnSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'consoleCdnSync',
				options: { durable: true }
			}
		},
		SELECTIVE_ROLLOUT: {
			NAME_IN_QUEUE_PUBLISHER_SERVICE: 'SELECTIVE_ROLLOUT',
			EXCHANGE: {
				name: 'selectiveRollOut',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'selectiveRollOut',
				options: { durable: true }
			}
		},
		ADP_TAG_SYNC: {
			EXCHANGE: {
				name: 'adpTagSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'adpTagSync',
				options: { durable: true }
			}
		},
		TRANSACTION_LOG_SYNC: {
			EXCHANGE: {
				name: 'transactionLogSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'transactionLogSync',
				options: { durable: true }
			}
		},
		ADSENSE_AD_SYNC: {
			EXCHANGE: {
				name: 'adsenseAdSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'adsenseAdSync',
				options: { durable: true }
			}
		},
		AMP_SCRIPT_SYNC: {
			EXCHANGE: {
				name: 'ampScriptSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'ampScriptSync',
				options: { durable: true }
			}
		},
		AMP_CDN_SYNC: {
			NAME_IN_QUEUE_PUBLISHER_SERVICE: 'AMP_CDN_SYNC',
			EXCHANGE: {
				name: 'ampConsoleCdnSync',
				type: 'direct',
				options: { durable: true }
			},
			QUEUE: {
				name: 'ampConsoleCdnSync',
				options: { durable: true }
			}
		}
	},
	sqlDatabases: {
		test: 'test',
		sql: 'central-sql',
		warehouse: 'central-warehouse'
	},
	sql: {},
	ampSettings: {
		selectors: {
			breadcrumb: { alias: 'Breadcrumb', value: 'breadcrumb' },
			headlineTitle: { alias: 'Headline Title', value: 'headlineTitle' },
			headlineSubtitle: {
				alias: 'Headline Subtitle',
				value: 'headlineSubtitle'
			},
			timeStampPublished: {
				alias: 'TimeStamp Published',
				value: 'timeStampPublished'
			},
			timeStampModified: {
				alias: 'TimeStamp Modified',
				value: 'timeStampModified'
			},
			authorInfo: { alias: 'Author Info', value: 'authorInfo' },
			articleContent: { alias: 'Article Content', value: 'articleContent' },
			logo: { alias: 'Logo', value: 'logo' }
		},
		socialApps: {
			facebook: { alias: 'Facebook', value: 'facebook' },
			twitter: { alias: 'Twitter', value: 'twitter' },
			linkedin: { alias: 'Linkedin', value: 'linkedin' },
			gmail: { alias: 'Gmail', value: 'gmail' },
			whatsapp: { alias: 'Whatsapp', value: 'whatsapp' },
			gplus: { alias: 'GPlus', value: 'gplus' }
		}
	},
	prebidServer: {
		host: 'https://amp.adpushup.com/' // please update this value in Client/config/config.js also
	},
	queuePublishingURL: 'http://localhost:9009',
	// urlReportingEnabledSites: [],
	// separatePrebidDisabledSites: [],
	// separateSiteSpecificPrebidBundleSites: [],
	prebidBundleUrl: 'http://localhost:8080/assets/js/builds/geniee/prebid/__FILE_NAME__',
	SCHEDULER_API_ROOT: 'http://localhost:8081/scheduler',
	prebidBundleDefaultName: 'prebid.js',
	// performanceLoggingEnabledSites: [37780],
	// sitesToDisableVideoWaitLimit: [],
	// disableAutoAddMultiformatForSites: [],
	bbPlayer: {
		sitesListKeyToBeUsed: 'whitelistedSites', // whitelistedSites/blacklistedSites
		whitelistedSites: [37780, 41159, 31454],
		blacklistedSites: [40792],
		enableLogging: true,
		loggingWhitelistedSites: [37780]
	},
	cdnOriginUrl: 'https://test.adpushup.com',
	weeklyDailySnapshots: {
		CONNECTION_STRING: '',
		CONTAINER_NAME: 'daily-weekly-snapshot',
		BASE_PATH: '',
		mailerQueueUrl: '',
		highchartsServer: '',
		highchartsServerPort: 7801
	},
	prefetchBlockedSites: ['41319'],
	autoBidderBlockEnabledSites: [37780],
	timeoutOptimisationEnabledSites: [37780],
	bidderBlockingSupportMail: 'rishav.chaudhary@adpushup.com',
	autoBlockCronSchedule: '0 0 * * 1',
	timeoutCronSchedule: '0 0 * * 1',
	consoleErrorAlerts: {
		supportMail: 'support@adpushup.com',
		hackersMail: 'hackers@adpushup.com'
	},
	mailerQueueUrl: 'https://queuepublisher.adpushup.com/publish',
	adsTxtSupportEmail: ['testemail@adpushup.com'],
	frequentReportsCachingLimit: 5,
	poweredByAdpushupBannerService: {
		enableOnSites: [],
		supportMail: 'hrishikesh.jangir@adpushup.com'
	},
	clsMonitoringAlerts: {
		hackersMail: 'hackers@adpushup.com',
		opsMail: 'cs-ops@adpushup.com'
	},
	mgDealsAlerts: {
		supportMails: 'abhishek.sontakke@adpushup.com'
	},
	googleSheetCreds: '',
	IS_GAM_API_NOT_WORKING: false,
	FORCE_REPORTING_DELAY_POPUP: false,
	SLACK_ENDPOINT: 'https://common-azure-function.azurewebsites.net/api/publish',
	API_MONITORING: {
		TIMEOUT: 60 * 1000,
		TITLE: 'Node API Request - Error Report',
		TIMEOUT_ERROR_MESSAGE: 'Request Timed Out',
		CHANNELS: ['C052KHBBRA4'],
		ENDPOINTS: [
			'/globalData',
			'/user/findUsers',
			'/reports/getWidgetData',
			'/reports/getMetaData',
			'/reports/getPaymentHistory'
		]
	}
};

/*
	Production
	consoleCdnSync - for cdn syncing and uploading adpushup.js
	genieeMCMZoneSync - for updating Geniee with adsense unit id and storing that id in our db
	genieeZoneSync - to sync unsynced zones with geniee and update channel doc and pulbish job to consoleCdnSync and MCM Automation


	adpDfpZoneSyncConsumer - /adpushup/QueueWorkers/adpDfpZoneSyncConsumer.js
	adsenseStatSyncService - /adpushup/App/app.js
	appCdnUpload - /adpushup/QueueWorkers/app.js
	consoleAdSyncConsumer - /adpushup/QueueWorkers/consoleAdSyncConsumer.js
	genieeZoneSyncConsumer - /adpushup/QueueWorkers/genieeZoneSyncConsumer.js
*/
