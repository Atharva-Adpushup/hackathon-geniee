import config from '../../../config/config';

const AMP_NAV_ITEMS_INDEXES = {
	CREATE_ADS: 'create-ads',
	MANAGE_ADS: 'manage-ads',
	CREATE_ADS_NEW: 'create-ads-new',
	MANAGE_ADS_NEW: 'manage-ads-new'
};

const AMP_NAV_ITEMS_VALUES = {
	CREATE_TAG: 'Create Tags(legacy)',
	MANAGE_TAG: 'Manage Tags(legacy)',
	CREATE_TAG_NEW: 'Create Tags',
	MANAGE_TAG_NEW: 'Manage Tags'
};

const AMP_NAV_ITEMS = {
	[AMP_NAV_ITEMS_INDEXES.CREATE_ADS_NEW]: {
		NAME: [AMP_NAV_ITEMS_VALUES.CREATE_ADS_NEW],
		INDEX: 1
	},
	[AMP_NAV_ITEMS_INDEXES.MANAGE_ADS_NEW]: {
		NAME: [AMP_NAV_ITEMS_VALUES.MANAGE_ADS_NEW],
		INDEX: 2
	},
	[AMP_NAV_ITEMS_INDEXES.CREATE_ADS]: {
		NAME: [AMP_NAV_ITEMS_VALUES.CREATE_ADS],
		INDEX: 3
	},
	[AMP_NAV_ITEMS_INDEXES.MANAGE_ADS]: {
		NAME: [AMP_NAV_ITEMS_VALUES.MANAGE_ADS],
		INDEX: 4
	}
};

const TYPES = [
	{
		name: 'Display',
		image: '/assets/images/tagManager/display.png',
		key: 'display',
		description:
			'A simple way to get ads on your page. Select size, generate code and you are good to go'
	},
	{
		name: 'Sticky',
		image: '/assets/images/tagManager/native.png',
		key: 'sticky',
		description:
			'Ads that flow seamlessly inside a list of articles or products on your site, offering a great user experience'
	}
];

const SIZES = {
	DISPLAY: {
		ALLOWED: ['mobile'],

		MOBILE: [
			'120x600',
			'160x600',
			'200x200',
			'240x400',
			'250x250',
			'300x50',
			'300x100',
			'300x250',
			'300x600',
			'320x50',
			'320x100',
			'320x480',
			'336x280'
		]
	},

	STICKY: {
		ALLOWED: ['mobile'],

		MOBILE: ['320x50', '320x100']
	}
};

const PREBID_SERVER_ENDPOINT = `${config.PREBID_SERVER_HOST}prebidserver/openrtb2/amp?tag_id=__AD_ID____MULTI_SIZE_QUERY_PARAM__`;

const AMP_FIXED_TARGETING = {
	adpushup_ran: '1',
	fluid: '1',
	da: 'adx'
};

const DISPLAYADCODE = `<amp-ad width="__WIDTH__" height="__HEIGHT__" type="doubleclick"__DYNAMIC_ATTRIBS__data-slot="/__NETWORK_CODE__/__AD_UNIT_CODE__" rtc-config='{
	"urls": [
	  "${PREBID_SERVER_ENDPOINT}&curl=CANONICAL_URL&gdpr_consent=CONSENT_STRING"
	]
}' json='{"targeting":__AMP_FIXED_TARGETING__}'>
</amp-ad>`;

const STICKYADCODE = `<amp-sticky-ad layout="nodisplay">
<amp-ad width="__WIDTH__" height="__HEIGHT__" type="doubleclick"__DYNAMIC_ATTRIBS__data-slot="/__NETWORK_CODE__/__AD_UNIT_CODE__" rtc-config='{
	"urls": [
	  "${PREBID_SERVER_ENDPOINT}&curl=CANONICAL_URL&gdpr_consent=CONSENT_STRING"
	]
}' json='{"targeting":__AMP_FIXED_TARGETING__}'>
</amp-ad>
</amp-sticky-ad>`;

// for new AMP Tag format
const DISPLAYADCODE_AMP = `<amp-ad width="__WIDTH__" height="__HEIGHT__" type="adpushup"__DYNAMIC_ATTRIBS__data-slotpath="/__NETWORK_CODE__/__AD_UNIT_CODE__"></amp-ad>`;

// for new AMP Tag format
const STICKYADCODE_AMP = `<amp-sticky-ad layout="nodisplay">
<amp-ad width="__WIDTH__" height="__HEIGHT__" type="adpushup"__DYNAMIC_ATTRIBS__data-slotpath="/__NETWORK_CODE__/__AD_UNIT_CODE__"> </amp-ad>
</amp-sticky-ad>`;

const DEFAULT_ADS_RESPONSE = { fetched: false, content: [] };
const DEFAULT_GLOBAL_RESPONSE = {
	currentAd: null
};

const AD_MESSAGE = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;"><a href="/sites/__SITE_ID__/settings">AdPushup head code</a> needs to be present in the global head of your website.</li>
	<li style="margin-bottom: 10px;"><a href="/adsTxtManagement">Ads.txt</a>  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: <a href="https://support.google.com/admanager/answer/7441288?hl=en" target="_blank">https://support.google.com/admanager/answer/7441288?hl=en</a>. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px;" class="u-text-red u-text-bold">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</li>`;

export {
	AMP_NAV_ITEMS_INDEXES,
	AMP_NAV_ITEMS_VALUES,
	AMP_NAV_ITEMS,
	TYPES,
	SIZES,
	DISPLAYADCODE,
	STICKYADCODE,
	DISPLAYADCODE_AMP,
	STICKYADCODE_AMP,
	AMP_FIXED_TARGETING,
	DEFAULT_ADS_RESPONSE,
	DEFAULT_GLOBAL_RESPONSE,
	AD_MESSAGE
};