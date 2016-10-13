module.exports = {
	SALT: '_ADP_RANDOMIZER_',
	BASE_URL: 'http://app.adpushup.com',
	PROXY_ORIGIN: 'http://proxy.app.adpushup.com',
	PROXY_DOCUMENT_DOMAIN: 'app.adpushup.com',
	ADRECOVER_ORIGIN: 'http://app.adrecover.com',
	isForceMcm: false,
	analytics: {
		'SEGMENT_APP_ID': 'vkVd688NyfGcgDhQwJSaiZofdEXvAZVQ',
		'INTERCOM_ID': 'WiCwcQZTNKXyiCLQMCD7EwD2dUAPznK34rByaIt3',
		'PIPEDRIVE_URL': 'http://www.adpushup.com/tech_integration/crm_scripts/callback/signup.php'
	},
	password: {
		'MASTER': 'fe4720b8bcdedb3cc47490015b0ab050'
	},
	user: {
		'fields': {
			'default': {
				'pageviewRange': '5000-15000',
				'adNetworks': ['Other']
			}
		}
	},
	enums: {
		priorities: {
			EXISTING_OBJECT: 'EXISTING_OBJECT',
			NEW_OBJECT: 'NEW_OBJECT'
		}
	},
	Queue: {
		SITES_TO_SYNC_ADSENSE: 'data::sitesToSyncAdsense',
		MCM_LINKS: 'data::mcmLinks'
	},
	errors: {
		NO_ADSENSE_ACCOUNT_CONNECTED: 'No adsense account connected',
		NO_ADS_TO_SYNC: 'No ads to sync yet',
		NO_INVITES_TO_CANCEL: 'No invites to cancel',
		USER_NOT_MANAGED: 'User is not managed'
	}
};

