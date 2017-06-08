module.exports = {
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: 'http://console.adpushup.com',
	PROXY_ORIGIN: 'http://proxy.app.adpushup.com',
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
	hbConfig: {
		'pulsepoint': {
			name: 'pulsepoint',
			isHb: true,
			global: {
				cp: {default: '560684', validations: {'required': true}, alias: "User Id", isEditable: true}
			},
			local: {
				ct: {validations: {'required': true}, alias: "Tag Id"},
				cf: {validations: {'required': true}, alias: "Tag Size"},
			}
		},
		'sekindoUM': {
			name: 'sekindoUM',
			isHb: true,
			global: {},
			local: {
				spaceId: {validations: {'required': true}, alias: "Space Id"},
			}
		},
		'wideorbit': {
			name: 'wideorbit',
			isHb: true,
			global: {
				pbId: {default: '577', validations: {'required': true}, alias: "Publisher Id", isEditable: true}
			},
			local: {
				pId: {validations: {'required': true, type: 'number'}, alias: "Tag Id"}
			}
		},

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
	supportedAdSizes: [
		{
			layoutType: 'SQUARE',
			sizes: [{ width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }, { width: 336, height: 280 }]
		},
		{
			layoutType: 'HORIZONTAL',
			sizes: [{ width: 728, height: 90 }, { width: 468, height: 60 }, { width: 900, height: 90 }, { width: 970, height: 250 }]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [{ width: 300, height: 600 }, { width: 160, height: 600 }, { width: 120, height: 600 }, { width: 300, height: 1050 }]
		},
		{
			layoutType: 'MOBILE',
			sizes: [{ width: 320, height: 50 }, { width: 300, height: 250 }, { width: 250, height: 250 }, { width: 200, height: 200 }, { width: 320, height: 100 }]
		},
	],
	analytics: {
		'SEGMENT_APP_ID': 'vkVd688NyfGcgDhQwJSaiZofdEXvAZVQ',
		'INTERCOM_ID': 'WiCwcQZTNKXyiCLQMCD7EwD2dUAPznK34rByaIt3',
		'PIPEDRIVE_URL': 'https://www.adpushup.com/tech_integration/crm_scripts/callback/signup.php',
		'PIPEDRIVE_SYNC_TOKEN': 'f4a90157f53a437a1f6b5c0d889b6d7db005f67e'
	},
	password: {
		'MASTER': 'fe4720b8bcdedb3cc47490015b0ab050'
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
					"REPORTS": 'https://beta-aladdin.geniee.jp/beta2/aladdin/adpushup/report/'
				}
			},
			exceptions: {
				str: {
					zonesEmpty: 'Zones should not be empty'
				}
			}
		}
	},
	user: {
		'fields': {
			'default': {
				'pageviewRange': '5000-15000',
				'adNetworks': ['Other']
			}
		}
	},
	site: {
		mode: {
			'DRAFT': 2,
			'PUBLISH': 1
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
		'development': 'development',
		'production': 'production'
	},
	locale: {
		support: ["en", "en_US", "ja", "ja_JP", "vi", "vi_VN"]
	}
};
