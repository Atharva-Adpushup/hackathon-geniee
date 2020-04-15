const AMP_NAV_ITEMS_INDEXES = {
	CREATE_ADS: 'create-ads',
	MANAGE_ADS: 'manage-ads'
};

const AMP_NAV_ITEMS_VALUES = {
	CREATE_TAG: 'Create Tags',
	MANAGE_TAG: 'Manage Tags'
};

const AMP_NAV_ITEMS = {
	[AMP_NAV_ITEMS_INDEXES.CREATE_ADS]: {
		NAME: [AMP_NAV_ITEMS_VALUES.CREATE_ADS],
		INDEX: 1
	},
	[AMP_NAV_ITEMS_INDEXES.MANAGE_ADS]: {
		NAME: [AMP_NAV_ITEMS_VALUES.MANAGE_ADS],
		INDEX: 2
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

		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	},

	STICKY: {
		ALLOWED: ['mobile'],

		MOBILE: ['320x50', '320x100']
	}
};

const CUSTOM_FIELDS = [
	{
		displayName: 'Max Height',
		key: 'maxHeight',
		inputType: 'number',
		placeholder: '',
		isRequired: false,
		attributes: { min: 50, max: 1050 },
		validationMessage: 'Max Size should be from 50 to 1050'
	}
];

const CUSTOM_FIELD_DEFAULT_VALUE = {
	NUMBER: null,
	STRING: ''
};

// const ADCODE = `<div id="__AD_ID__" class="_ap_apex_ad"__CUSTOM_ATTRIBS__>
// 	<script>
// 		var adpushup = adpushup || {};
// 		adpushup.que = adpushup.que || [];
// 		adpushup.que.push(function() {
// 			adpushup.triggerAd("__AD_ID__");
// 		});
// 	</script>
// </div>`;

const DISPLAYADCODE = `<amp-ad width="__WIDTH__" height="__HEIGHT__" type="doubleclick" __REFRESH_INTERVAL__ __MULTI_SIZE__ data-slot="/__NETWORK_CODE__/__AD_UNIT_CODE__" rtc-config='{
	"urls": [
	  "https://localhost:8089/openrtb2/amp?tag_id=__AD_ID__"
	]
}' json='{"targeting":{"amp_test":["1"]}}'>
</amp-ad>`;

const STICKYADCODE = `<amp-sticky-ad layout="nodisplay">
<amp-ad width="__WIDTH__" height="__HEIGHT__" type="doubleclick" __REFRESH_INTERVAL__ __MULTI_SIZE__ data-slot="/__NETWORK_CODE__/__AD_UNIT_CODE__" rtc-config='{
	"urls": [
	  "https://localhost:8089/openrtb2/amp?tag_id=__AD_ID__"
	]
}' json='{"targeting":{"amp_test":["1"]}}'>
</amp-ad>
</amp-sticky-ad>`;

const DEFAULT_ADS_RESPONSE = { fetched: false, content: [] };
const DEFAULT_GLOBAL_RESPONSE = {
	currentAd: null
};

const DISPLAY_AD_MESSAGE = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;"><a href="/sites/__SITE_ID__/settings">AdPushup head code</a> needs to be present in the global head of your website.</li>
	<li style="margin-bottom: 10px;"><a href="/adsTxtManagement">Ads.txt</a>  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: <a href="https://support.google.com/admanager/answer/7441288?hl=en" target="_blank">https://support.google.com/admanager/answer/7441288?hl=en</a>. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px;" class="u-text-red u-text-bold">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</li>`;

export {
	AMP_NAV_ITEMS_INDEXES,
	AMP_NAV_ITEMS_VALUES,
	AMP_NAV_ITEMS,
	TYPES,
	SIZES,
	CUSTOM_FIELDS,
	CUSTOM_FIELD_DEFAULT_VALUE,
	DISPLAYADCODE,
	STICKYADCODE,
	DEFAULT_ADS_RESPONSE,
	DEFAULT_GLOBAL_RESPONSE,
	DISPLAY_AD_MESSAGE
};
