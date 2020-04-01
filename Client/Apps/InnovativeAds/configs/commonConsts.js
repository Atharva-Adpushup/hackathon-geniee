const EVENTS = {
	SCRIPT_LOADED: 'scriptLoaded',
	SCROLL: 'scroll'
};
const PLATFORMS = [
	{
		name: 'Desktop',
		image: '/assets/images/interactiveAdsManager/devices/desktop.png',
		key: 'desktop'
	},
	{
		name: 'Mobile',
		image: '/assets/images/interactiveAdsManager/devices/smartphone.png',
		key: 'mobile'
	},
	{
		name: 'Tablet',
		image: '/assets/images/interactiveAdsManager/devices/tablet.png',
		key: 'tablet'
	}
];
const FORMATS = {
	DESKTOP: [
		{
			name: 'Sticky Top',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-top.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-top-disabled.jpg',
			key: 'stickyTop'
		},
		{
			name: 'Sticky Left',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-left.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-left-disabled.jpg',
			key: 'stickyLeft'
		},
		{
			name: 'Sticky Right',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-right.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-right-disabled.jpg',
			key: 'stickyRight'
		},
		{
			name: 'Sticky Bottom',
			image: '/assets/images/interactiveAdsManager/formats/desktop/sticky-bottom.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/sticky-bottom-disabled.jpg',
			key: 'stickyBottom'
		},
		{
			name: 'In View',
			image: '/assets/images/interactiveAdsManager/formats/desktop/in-view.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/in-view-disabled.jpg',
			key: 'inView'
		},
		{
			name: 'Docked',
			image: '/assets/images/interactiveAdsManager/formats/desktop/docked.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/desktop/docked-disabled.jpg',
			key: 'docked'
		}
	],
	MOBILE: [
		{
			name: 'Sticky Top',
			image: '/assets/images/interactiveAdsManager/formats/mobile/sticky-top.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/sticky-top-disabled.jpg',
			key: 'stickyTop'
		},
		{
			name: 'Sticky Bottom',
			image: '/assets/images/interactiveAdsManager/formats/mobile/sticky-bottom.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/sticky-bottom-disabled.jpg',
			key: 'stickyBottom'
		},
		{
			name: 'In View',
			image: '/assets/images/interactiveAdsManager/formats/mobile/in-view.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/mobile/in-view-disabled.jpg',
			key: 'inView'
		}
	],
	TABLET: [
		{
			name: 'Sticky Top',
			image: '/assets/images/interactiveAdsManager/formats/tablet/sticky-top.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/tablet/sticky-top-disabled.jpg',
			key: 'stickyTop'
		},
		{
			name: 'Sticky Bottom',
			image: '/assets/images/interactiveAdsManager/formats/tablet/sticky-bottom.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/tablet/sticky-bottom-disabled.jpg',
			key: 'stickyBottom'
		},
		{
			name: 'In View',
			image: '/assets/images/interactiveAdsManager/formats/tablet/in-view.gif',
			disabled: '/assets/images/interactiveAdsManager/formats/tablet/in-view-disabled.jpg',
			key: 'inView'
		}
	]
};
const SIZES = {
	DESKTOP: {
		DOCKED: ['336x280', '300x250', '250x250', '200x200', '300x600', '160x600', '120x600'],
		INVIEW: ['336x280', '300x250', '250x250', '200x200', '728x90', '468x60', '900x90'],
		STICKYTOP: ['900x90', '728x90'],
		STICKYBOTTOM: ['900x90', '728x90'],
		STICKYLEFT: ['160x600', '300x600', '120x600'],
		STICKYRIGHT: ['160x600', '300x600', '120x600']
	},
	MOBILE: {
		STICKYTOP: ['320x100', '300x100', '320x50', '300x50'],
		STICKYBOTTOM: ['320x100', '300x100', '320x50', '300x50'],
		INVIEW: ['336x280', '300x250', '250x250', '200x200', '320x100', '300x100', '320x50', '300x50']
	},
	TABLET: {
		STICKYTOP: ['728x90'],
		STICKYBOTTOM: ['728x90'],
		INVIEW: ['300x250']
	}
};
const interactiveAdEvents = ['DOMContentLoaded', 'scriptLoaded']; // load', 'scroll', 'onMills',
const displayAdMessage = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;"><a href="/sites/__SITE_ID__/settings">AdPushup head code</a> needs to be present in the global head of your website.</li>
	<li style="margin-bottom: 10px;"><a href="/adsTxtManagement">Ads.txt</a>  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: <a href="https://support.google.com/admanager/answer/7441288?hl=en" target="_blank">https://support.google.com/admanager/answer/7441288?hl=en</a>. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px;" class="u-text-red u-text-bold">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</li>
</ol>
`;
const interactiveAdMessage =
	'Ad has been created. AdPushup will automatically insert ad on your site on the runtime. <div style="margin: 10px 0px; font-size: 16px; color: red; font-weight: bold; color: #eb575c">If you are creating the ads for the first time, please wait for 24-48 hours for our operations team to review and approve the website. You\'ll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</div>';

// IA abbreviation stands for Innovative Ads
const IA_NAV_ITEMS_INDEXES = {
	CREATE_ADS: 'create-ads',
	MANAGE_ADS: 'manage-ads'
};

const IA_NAV_ITEMS_VALUES = {
	CREATE_ADS: 'Create Ads',
	MANAGE_ADS: 'Manage Ads'
};

const IA_NAV_ITEMS = {
	[IA_NAV_ITEMS_INDEXES.CREATE_ADS]: {
		NAME: [IA_NAV_ITEMS_VALUES.CREATE_ADS],
		INDEX: 1
	},
	[IA_NAV_ITEMS_INDEXES.MANAGE_ADS]: {
		NAME: [IA_NAV_ITEMS_VALUES.MANAGE_ADS],
		INDEX: 2
	}
};

const AD_OPERATIONS = ['APPEND', 'PREPEND', 'INSERT AFTER', 'INSERT BEFORE'];
const TYPE_OF_ADS = {
	STRUCTURAL: 1,
	IN_CONTENT: 2,
	INTERACTIVE_AD: 3,
	DOCKED_STRUCTURAL: 4,
	EXTERNAL_TRIGGER_AD: 5,
	LAZYLOAD_STRUCTURAL: 6
};
const INTERACTIVE_ADS_TYPES = {
	VERTICAL: ['stickyLeft', 'stickyRight', 'docked'],
	HORIZONTAL: ['stickyTop', 'stickyBottom'],
	OTHER: ['inView']
};

const USER_AD_LIST_HEADERS = [
	'Id',
	'Name',
	'Platform',
	'Format',
	'Size',
	'Traffic',
	'Status',
	'Actions'
];
const OPS_AD_LIST_HEADERS = [
	'Id',
	'Name',
	'Platform',
	'Format',
	'Size',
	'Network',
	'Traffic',
	'Status',
	'Actions'
];
const USER_AD_LIST_ACTIONS = [
	{ displayText: 'Archive', key: 'archive' },
	{ displayText: 'Unarchive', key: 'unarchive' },
	{ displayText: 'Format Options', key: 'formatEdit' }
];
const OPS_AD_LIST_ACTIONS = [
	{ displayText: 'Network Options', key: 'networkEdit' },
	{ displayText: 'Archive', key: 'archive' },
	{ displayText: 'Unarchive', key: 'unarchive' },
	{ displayText: 'Format Options', key: 'formatEdit' },
	{ displayText: 'Edit Fluid', key: 'fluidEdit' }
];
const AD_LIST_ACTIONS = {
	copy: {
		tooltipText: 'Copy',
		iconClass: 'copy'
	},
	edit: {
		tooltipText: 'Edit',
		iconClass: 'edit'
	}
};
const NOOP = () => {};
const STATUS_FILTER_OPTIONS = [
	{
		name: 'Active',
		value: true
	},
	{
		name: 'Archived',
		value: false
	}
];
const FORMAT_FILTER_OPTIONS = [
	{
		name: 'Sticky Top',
		value: 'stickyTop'
	},
	{
		name: 'Sticky Bottom',
		value: 'stickyBottom'
	},
	{
		name: 'Sticky Left',
		value: 'stickyLeft'
	},
	{
		name: 'Sticky Right',
		value: 'stickyRight'
	},
	{
		name: 'Docked',
		value: 'docked'
	},
	{
		name: 'In View',
		value: 'inView'
	}
];
const DEFAULT_ADS_RESPONSE = { fetched: false, content: [] };
const DEFAULT_GLOBAL_RESPONSE = {
	meta: { fetched: false, content: {} },
	channels: [],
	currentAd: null
};
const REFRESH_INTERVALS = [
	{
		name: '30',
		value: 30
	},
	{
		name: '60',
		value: 60
	},
	{
		name: '90',
		value: 90
	},
	{
		name: '120',
		value: 120
	},
	{
		name: '180',
		value: 180
	},
	{
		name: '240',
		value: 240
	},
	{
		name: '300',
		value: 300
	},
	{
		name: '360',
		value: 360
	}
];
const DEFAULT_REFRESH_INTERVAL = 30;

export {
	EVENTS,
	PLATFORMS,
	FORMATS,
	SIZES,
	displayAdMessage,
	interactiveAdMessage,
	interactiveAdEvents,
	AD_OPERATIONS,
	TYPE_OF_ADS,
	INTERACTIVE_ADS_TYPES,
	USER_AD_LIST_HEADERS,
	OPS_AD_LIST_HEADERS,
	USER_AD_LIST_ACTIONS,
	OPS_AD_LIST_ACTIONS,
	AD_LIST_ACTIONS,
	NOOP,
	STATUS_FILTER_OPTIONS,
	FORMAT_FILTER_OPTIONS,
	IA_NAV_ITEMS,
	IA_NAV_ITEMS_INDEXES,
	IA_NAV_ITEMS_VALUES,
	DEFAULT_ADS_RESPONSE,
	DEFAULT_GLOBAL_RESPONSE,
	REFRESH_INTERVALS,
	DEFAULT_REFRESH_INTERVAL
};
