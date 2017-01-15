module.exports = {
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: 'http://console.adpushup.com',
	PROXY_ORIGIN: 'http://proxy.app.adpushup.com',
	PROXY_DOCUMENT_DOMAIN: 'app.adpushup.com',
	apConfigDefaults: {
		heartBeatMinInterval: 3000,
		heartBeatStartDelay: 2000,
		xpathWaitTimeout: 5000,
		adpushupPercentage: 100
	},
	hbConfig: {
		'pulsePoint': {
			name: 'pulsepoint',
			isHb: true,
			global: {
				cf: {default: '560684', validations: {'required': true}, alias: "UserId", isEditable: true}
			},
			local: {
				ct: {validations: {'required': true}, alias: "AdId"}
			}
		},
		'wideOrbit': {
			name: 'wideorbit',
			isHb: true,
			global: {
				pbId: {default: '560684', validations: {'required': true}, alias: "UserId", isEditable: true}
			},
			local: {
				pId: {validations: {'required': true, type: 'number'}, alias: "AdId"}
			}
		},
		
	},
	hbContinents: [
		{ name: 'Europe', value: 'EUR' },
		{ name: 'Oceania', value: 'OAN' },
		{ name: 'Africa', value: 'AFR' },
		{ name: 'Asia', value: 'ASA' },
		{ name: 'North America', value: 'NAA' },
		{ name: 'South America', value: 'SAA' },
		{ name: 'Middle East', value: 'MEA' }
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
	password: {
		'MASTER': 'fe4720b8bcdedb3cc47490015b0ab050'
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
	}
};

