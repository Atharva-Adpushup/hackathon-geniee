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
	cacheFlyFtp: {
		HOST: '127.0.0.1',
		USERNAME: 'anonymous'
	},
	elasticServer: {
		host: 'localhost:9200',
		log: 'trace',
		requestTimeout: 3500 // in ms
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
		}
	},
	sqlDatabases: {
		test: 'test',
		sql: 'central-sql',
		warehouse: 'central-warehouse'
	},
	sql: {
	},
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
		host: 'https://amp.adpushup.com/'
	},
	queuePublishingURL: 'http://localhost:9009',
	urlReportingEnabledSites: [],
	// separatePrebidEnabledSites: [],
	separatePrebidDisabledSites: [],
	prebidBundleUrl: 'http://localhost:8080/assets/js/builds/geniee/prebid/__FILE_NAME__',
	SCHEDULER_API_ROOT: 'http://localhost:8081/scheduler',
	prebidBundleDefaultName: 'prebid.js',
	performanceLoggingEnabledSites: [37780],
	sitesToDisableVideoWaitLimit: [],
	disableAutoAddMultiformatForSites: [],
	sitesToEnableBbPlayer: [37780],
	// sitesToDisableBbPlayer: [40792],
	enableBbPlayerLogging: false
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
