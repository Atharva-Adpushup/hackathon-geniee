// OP abbreviation stands for Ops Panel
const adUnitsData = [
	{
		dfpAdUnit: 'Ad_Exchange_Display',
		dfpAdUnitCode: 'ca-pub-3336221094684785-tag',
		size: '320x100',
		platform: 'DESKTOP/TABLET/MOBILE'
	}
];

const adUnitsHeaders = [
	{ label: 'Ad Unit Code ', key: 'code' },
	{ label: 'Width ', key: 'width' },
	{ label: 'Height ', key: 'height' },
	{ label: 'Ap Tag Id ', key: 'apTagId' },
	{ label: 'Platform ', key: 'platform' },
	{ label: 'Active ', key: 'isActive' },
	{ label: 'Display ', key: 'formats.display' },
	{ label: 'Video ', key: 'formats.video' },
	{ label: 'Native ', key: 'formats.native' }
];

const OP_NAV_ITEMS_INDEXES = {
	ACCOUNT_SETTINGS: 'account-settings',
	SITE_SETTINGS: 'site-settings',
	INFO_PANEL: 'info-panel',
	INFO_PANEL_QUICK_SNAPSHOT: 'QUICK_SNAPSHOT',
	INFO_PANEL_REPORT_VITALS: 'REPORT_VITALS',
	INFO_PANEL_GLOBAL_REPORT_VITALS: 'GLOBAL_REPORT_VITALS',
	SITES_MAPPING: 'sites-mapping',
	TOOLS: 'tools'
};

// prettier-ignore
const ALL_MONTHS_NAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const OP_NAV_ITEMS_VALUES = {
	ACCOUNT_SETTINGS: 'Account Settings',
	SITE_SETTINGS: 'Site Settings',
	INFO_PANEL: 'Info Panel',
	SITES_MAPPING: 'Site Mapping',
	TOOLS: 'Tools'
};

const OP_NAV_ITEMS = {
	[OP_NAV_ITEMS_INDEXES.ACCOUNT_SETTINGS]: {
		NAME: [OP_NAV_ITEMS_VALUES.ACCOUNT_SETTINGS],
		INDEX: 1
	},
	[OP_NAV_ITEMS_INDEXES.SITE_SETTINGS]: {
		NAME: [OP_NAV_ITEMS_VALUES.SITE_SETTINGS],
		INDEX: 2
	},
	[OP_NAV_ITEMS_INDEXES.INFO_PANEL]: {
		NAME: [OP_NAV_ITEMS_VALUES.INFO_PANEL],
		INDEX: 3
	},
	[OP_NAV_ITEMS_INDEXES.SITES_MAPPING]: {
		NAME: [OP_NAV_ITEMS_VALUES.SITES_MAPPING],
		INDEX: 4
	},
	[OP_NAV_ITEMS_INDEXES.TOOLS]: {
		NAME: [OP_NAV_ITEMS_VALUES.TOOLS],
		INDEX: 5
	}
};

const REPORTS_NAV_ITEMS_INDEXES = {
	REPORT: 'report'
};

const REPORTS_NAV_ITEMS_VALUES = {
	REPORT: 'Report'
};

const REPORTS_NAV_ITEMS = {
	[REPORTS_NAV_ITEMS_INDEXES.REPORT]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.REPORT],
		INDEX: 1
	}
};
const SITES_MAPPING = {
	LABELS: [
		'Site Id',
		'Site Domain',
		'Owner Email',
		'Channels',
		'Mode',
		'Status',
		'Custom Sizes',
		'Date Created',
		'Publisher Id',
		'Adsense Email'
	],
	// LABELS: {
	// 	siteId: 'Site Id',
	// 	siteDomain: 'Site Domain',
	// 	ownerEmail: 'Owner Email',
	// 	channels: 'Channels',
	// 	mode: 'Mode',
	// 	step: 'Status',
	// 	customSizes: 'Custom Sizes',
	// 	dateCreated: 'Date Created',
	// 	pubId: 'Publisher Id',
	// 	adsenseEmail: 'Adsense Email'
	// },
	HEADERS: [
		{
			title: 'Site Id',
			prop: 'Site Id',
			sortable: true,
			filterable: true
		},
		{
			title: 'Site Domain',
			prop: 'Site Domain',
			sortable: true,
			filterable: true
		},
		{
			title: 'Owner Email',
			prop: 'Owner Email',
			sortable: true,
			filterable: true
		},
		{
			title: 'Mode',
			prop: 'Mode',
			filterable: true
		},
		{
			title: 'Date Created',
			prop: 'Date Created',
			sortable: true,
			filterable: true
		},
		{
			title: 'Channels',
			prop: 'Channels',
			sortable: true,
			filterable: true
		},
		{
			title: 'Status',
			prop: 'Status',
			sortable: true,
			filterable: true
		},
		{
			title: 'Publisher Id',
			prop: 'Publisher Id',
			sortable: true,
			filterable: true
		},
		{
			title: 'Adsense Email',
			prop: 'Adsense Email',
			sortable: true,
			filterable: true
		}
		// {
		// 	title: 'Custom Sizes',
		// 	prop: 'Custom Sizes',
		// 	sortable: true,
		// 	filterable: true
		// }
	],
	MODES: [
		{
			name: 'Both',
			value: 0
		},
		{
			name: 'Live',
			value: 1
		},
		{
			name: 'Draft',
			value: 2
		}
	],
	STATUSES: [
		{
			name: 'All',
			value: 0
		},
		{
			name: 'Pre-onboarding',
			value: 1
		},
		{
			name: 'Onboarding',
			value: 2
		},
		{
			name: 'Onboarded',
			value: 3
		}
	]
};

const TABLET_LAYOUT_OPTIONS = [
	{
		name: 'Desktop',
		value: 'desktop',
		text: 'Desktop'
	},
	{
		name: 'Mobile',
		value: 'mobile',
		text: 'Mobile'
	}
];

const PAGEGROUP_DEVICE_OPTIONS = [
	...TABLET_LAYOUT_OPTIONS,
	{
		name: 'Tablet',
		value: 'tablet',
		text: 'Tablet'
	}
];

const GDPR = {
	compliance: false,
	cookieControlConfig: {
		apiKey: '065eea801841ec9ad57857fa1f5248a14f27bb3e',
		iabCMP: true,
		product: 'PRO_MULTISITE',
		optionalCookies: [
			{
				name: 'information storage and access',
				label: 'Information storage and access',
				description:
					'The storage of information, or access to information that is already stored, on your device such as advertising identifiers, device identifiers, cookies, and similar technologies.',
				cookies: [],
				onAccept() {},
				onRevoke() {}
			},
			{
				name: 'personalisation',
				label: 'Personalisation',
				description:
					'The collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as on other websites or apps, over time. Typically, the content of the site or app is used to make inferences about your interests, which inform future selection of advertising and/or content.',
				cookies: [],
				onAccept() {},
				onRevoke() {}
			},
			{
				name: 'ad selection, delivery, reporting',
				label: 'Ad selection, delivery, reporting',
				description:
					'The collection of information, and combination with previously collected information, to select and deliver advertisements for you, and to measure the delivery and effectiveness of such advertisements. This includes using previously collected information about your interests to select ads, processing data about what advertisements were shown, how often they were shown, when and where they were shown, and whether you took any action related to the advertisement, including for example clicking an ad or making a purchase. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise advertising and/or content for you in other contexts, such as websites or apps, over time.',
				cookies: [],
				onAccept() {},
				onRevoke() {}
			},
			{
				name: 'content selection, delivery, reporting',
				label: 'Content selection, delivery, reporting',
				description:
					'The collection of information, and combination with previously collected information, to select and deliver content for you, and to measure the delivery and effectiveness of such content. This includes using previously collected information about your interests to select content, processing data about what content was shown, how often or how long it was shown, when and where it was shown, and whether the you took any action related to the content, including for example clicking on content. This does not include personalisation, which is the collection and processing of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, such as websites or apps, over time.',
				cookies: [],
				onAccept() {},
				onRevoke() {}
			},
			{
				name: 'measurement',
				label: 'Measurement',
				description:
					'The collection of information about your use of the content, and combination with previously collected information, used to measure, understand, and report on your usage of the service. This does not include personalisation, the collection of information about your use of this service to subsequently personalise content and/or advertising for you in other contexts, i.e. on other service, such as websites or apps, over time.',
				cookies: [],
				onAccept() {},
				onRevoke() {}
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
};

const DFP_ACCOUNTS_DEFAULT = [
	{
		name: '103512698 - AdPushup, Inc',
		value: '103512698-102512818-USD'
	}
];

const ADPUSHUP_DFP = {
	name: 'adpushup, inc',
	code: '103512698',
	currency: 'USD'
};

const TOOLS_IDENTIFIERS = {
	BACKUP_ADS: 'BACKUP_ADS',
	ENABLE_HB_BIDDER: 'ENABLE_HB_BIDDER',
	REGEX_VERIFICATION: 'REGEX_VERIFICATION',
	REGEX_GENERATION: 'REGEX_GENERATION',
	TOP_XPATH_MISS_MODE_URL: 'TOP_XPATH_MISS_MODE_URL',
	LOST_FOUND_LIVE_SITES: 'LOST_FOUND_LIVE_SITES',
	ADS_TXT_LIVE_SITES: 'ADS_TXT_LIVE_SITES',
	BIDDER_CONFIGURATIONS: 'BIDDER_CONFIGURATIONS',
	DASHBOARD_NOTIFICATIONS: 'DASHBOARD_NOTIFICATIONS',
	BIDDER_RULES: 'BIDDER_RULES',
	INVENTORY: 'INVENTORY',
	MG_DEAL: 'MG_DEAL',
	PAYMENT_DISCREPANCY: 'PAYMENT_DISCREPANCY'
};

const ADS_TXT_LIVE_SITES_ENTRIES = [
	{ name: 'Missing Entries', value: 'Missing Entries' },
	{ name: 'Present Entries', value: 'Present Entries' },
	{ name: 'Global Entries', value: 'Global Entries' },
	{ name: 'Mandatory Ads.txt Snippet Missing', value: 'Mandatory Ads.txt Snippet Missing' },
	{ name: 'Mandatory Ads.txt Snippet Present', value: 'Mandatory Ads.txt Snippet Present' },
	{ name: 'No Ads.Txt Present', value: 'No Ads.Txt Present' }
];

const ADS_TXT_LIVE_SITES_STATUS = {
	ALL_PRESENT: 1,
	ALL_MISSING: 2,
	PARTIAL_PRESENT: 3,
	NO_ADS_TXT: 4
};

const INFO_PANEL_IDENTIFIERS = {
	QUICK_SNAPSHOT: 'QUICK_SNAPSHOT',
	REPORT_VITALS: 'REPORT_VITALS',
	GLOBAL_REPORT_VITALS: 'GLOBAL_REPORT_VITALS'
};

const TOP_TEN_SITE_WIDGETS_COLUMNS = [
	'adpushup_page_views',
	'adpushup_page_cpm',
	'network_ad_ecpm',
	'siteid',
	'network_net_revenue',
	'network_impressions'
];

const WIDGETS_INFO = {
	ESTIMATED_EARNINGS: 'estimated_earnings',
	PER_AP_ORIGINAL: 'per_ap_original',
	PER_OVERVIEW: 'per_overview',
	OPS_TOP_SITES: 'ops_top_sites',
	OPS_COUNTRY_REPORT: 'ops_country_report',
	OPS_NETWORK_REPORT: 'ops_network_report',
	OPS_ERROR_REPORT: 'ops_error_report'
};

const QUICK_SNAPSHOTS_WIDGETS = [
	WIDGETS_INFO.ESTIMATED_EARNINGS,
	WIDGETS_INFO.PER_AP_ORIGINAL,
	WIDGETS_INFO.PER_OVERVIEW,
	WIDGETS_INFO.OPS_TOP_SITES,
	WIDGETS_INFO.OPS_COUNTRY_REPORT,
	WIDGETS_INFO.OPS_NETWORK_REPORT,
	WIDGETS_INFO.OPS_ERROR_REPORT
];

const ICONS = {
	0: {
		isVisible: false,
		icon: 'question',
		styles: { display: 'none' },
		className: '',
		title: 'Status Unknown'
	},
	1: {
		isVisible: true,
		icon: 'times',
		styles: {},
		className: 'u-text-error',
		title: 'Pagegroup pattern not found'
	},
	2: {
		isVisible: true,
		icon: 'check',
		styles: {},
		className: 'u-text-success',
		title: 'All fine'
	},
	3: {
		isVisible: true,
		icon: 'times',
		styles: {},
		className: 'u-text-yellow',
		title: 'Url matching multiple pagegroup patterns'
	},
	4: {
		isVisible: true,
		icon: 'times',
		styles: {},
		className: 'u-text-error',
		title: 'Url does not match the corresponding pagegroup pattern'
	}
};

const BACKUP_ADS_FORMATS = [
	{
		name: 'JS',
		value: 'js',
		text: 'JS'
	},
	{
		name: 'HTML',
		value: 'html',
		text: 'HTML'
	},
	{
		name: 'TEXT',
		value: 'txt',
		text: 'TEXT'
	}
];

const XPATH_MODE_URL = {
	devices: [
		{ name: 'Desktop', value: 'Desktop' },
		{ name: 'Mobile', value: 'Mobile' },
		{ name: 'Tablet', value: 'Tablet' }
	],
	modes: [
		{ name: 'Mode 1', value: 1 },
		{ name: 'Mode 2', value: 2 }
	],
	ORDER_BY_PARAMS: [
		{ name: 'Hits', value: 'hits' },
		{ name: 'XPath Miss', value: 'xpath_miss' },
		{ name: 'Impressions', value: 'impressions' },
		{ name: 'Url', value: 'url' }
	]
};

const SITE_MAPPING_COLUMNS = [
	{
		Header: 'Site ID',
		accessor: 'siteId'
	},
	{
		Header: 'Domain',
		accessor: 'domain'
	},
	{
		Header: 'Owner Email',
		accessor: 'accountEmail'
	},
	{
		Header: 'Account ID',
		accessor: 'sellerId'
	},
	{
		Header: 'Onboarding Status',
		accessor: 'onboardingStatus'
	},
	{
		Header: 'Active Status',
		accessor: 'activeStatus'
	},
	{
		Header: 'Date Created',
		accessor: 'dateCreated'
	},
	{
		Header: 'Active Products',
		accessor: 'activeProducts'
	},
	{
		Header: 'Active Bidders',
		accessor: 'activeBidders'
	},
	{
		Header: 'Inactive Bidders',
		accessor: 'inactiveBidders'
	},
	{
		Header: 'Rev Share(in %)',
		accessor: 'revenueShare'
	},
	{
		Header: 'Instream Rev Share(in %)',
		accessor: 'instreamRevenueShare'
	},
	{
		Header: 'Publisher Id',
		accessor: 'publisherId'
	},
	{
		Header: 'Auth Email',
		accessor: 'authEmail'
	},
	{
		Header: 'Ad Manager',
		accessor: 'adManager'
	}
];

const MG_DEALS_COLUMNS = [
	{
		Header: 'Email',
		accessor: 'email'
	},
	{
		Header: 'Site Ids',
		accessor: 'accountSiteIds'
	},
	{
		Header: 'Gross Revenue',
		accessor: 'grossRevenue'
	},
	{
		Header: 'Net Revenue',
		accessor: 'netRevenue'
	},
	{
		Header: 'MG Revenue',
		accessor: 'mgDealRevenue'
	},
	{
		Header: 'Active Quarter',
		accessor: 'activeQuarter'
	}
];

const ERROR_REPORT_PROPS = {
	chart: {
		type: 'pie',
		renderTo: 'error-code'
	},
	credits: {
		enabled: false
	},
	title: {
		text: ''
	},
	subtitle: {
		text: ''
	},
	plotOptions: {
		pie: {
			shadow: false,
			center: ['50%', '50%']
		}
	},
	tooltip: {
		valueSuffix: '%'
	}
};

const MODE_TOOLTIP_TEXT = `ADPUSHUP:1 , FALLBACK:2`;
const ERROR_TOOLTIP_TEXT = `UNKNOWN:0, NO_ERROR:1, PAGEGROUP_NOT_FOUND:2, FALLBACK_PLANNED:3, FALLBACK_FORCED:4, PAUSED_IN_EDITOR:5, VARIATION_NOT_SELECTED:6`;
const PREBID_CURRENCY_URL = '//cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json';

const HB_BIDDERS_KEYS_NULL_SHOULD_NOT_BE_NULL = [
	'sizeLess',
	'reusable',
	'bids',
	'revenueShare',
	'params'
];

const REFRESH_RATE_ENTRIES = [
	{ name: '30 seconds', value: 30, default: true },
	{ name: '45 seconds', value: 45 },
	{ name: '60 seconds', value: 60 },
	{ name: '90 seconds', value: 90 },
	{ name: '120 seconds', value: 120 },
	{ name: '180 seconds', value: 180 },
	{ name: '240 seconds', value: 240 },
	{ name: '300 seconds', value: 300 },
	{ name: '360 seconds', value: 360 }
];

const UNFILLED_REFRESH_RATE_ENTRIES = [
	{ name: '5 seconds', value: 5, default: true },
	{ name: '10 seconds', value: 10 },
	{ name: '20 seconds', value: 20 },
	{ name: '30 seconds', value: 30 },
	{ name: '60 seconds', value: 60 },
	{ name: '90 seconds', value: 90 },
	{ name: '120 seconds', value: 120 },
	{ name: '180 seconds', value: 180 },
	{ name: '240 seconds', value: 240 },
	{ name: '300 seconds', value: 300 },
	{ name: '360 seconds', value: 360 }
];

const TRIGGER_KEY_OPTIONS = [
	{
		label: 'Country',
		value: 'country'
	},
	{
		label: 'Device',
		value: 'device'
	},
	{
		label: 'Time Range',
		value: 'time_range'
	},
	{
		label: 'Day of the Week',
		value: 'day_of_the_week'
	},
	{
		label: 'Ad Unit',
		value: 'adunit'
	}
];

const TRIGGER_OPERATOR_OPTIONS = [
	{
		label: 'IS IN',
		value: 'contain'
	},
	{
		label: 'IS NOT IN',
		value: 'not_contain'
	}
];

const ACTION_KEY_OPTIONS = [
	{
		label: 'Allow Bidders',
		value: 'allowed_bidders'
	},
	{
		label: 'Disallow Bidders',
		value: 'disallowed_bidders'
	}
];

const WEEKEND = ['saturday', 'sunday'];
const WEEKDAY = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const PNP_REPLACE_TYPES = [
	{ name: 'Active View Replace', value: 'activeView' },
	{ name: 'Active Tab Replace', value: 'activeTab' },
	{ name: 'Background Replace', value: 'bgRefresh' }
];

const GA_ACCESS_EMAIL_OPTIONS = [
	{
		name: 'support@adpushup.com',
		value: 'support@adpushup.com'
	},
	{
		name: 'pub_invite@adpushup.com',
		value: 'pub_invite@adpushup.com'
	},
	{
		name: 'publisher_invite@adpushup.com',
		value: 'publisher_invite@adpushup.com'
	},
	{
		name: 'analytics@adpushup.com',
		value: 'analytics@adpushup.com'
	}
];

const GA_VERSION_OPTIONS = [
	{
		name: '3',
		value: 3
	},
	{
		name: '4',
		value: 4
	}
];

const GA_EVENT_SAMPLING = 100;

const TYPE_TEXT = 'text';
const TYPE_NUMBER = 'number';
const AP_LIGHT_AD_UNIT_OPERATIONS = [
	{ name: 'Append', value: 'append', default: true },
	{ name: 'Replace', value: 'replace' }
];

const PNP_AD_UNIT_OPERATIONS = [
	{ name: 'Append', value: 'append', default: true },
	{ name: 'Replace', value: 'replace' }
];

const POWERED_BY_BANNER = [
	{ label: 'Docked', value: 'DOCKED' },
	{ label: 'Display', value: 'DISPLAY' },
	{ label: 'Sticky Bottom', value: 'STICKYBOTTOM' },
	{ label: 'Chained Docked', value: 'CHAINED_DOCKED' }
];

const OUTBRAIN_DISABLED = {
	// NOTE: Please do the script name related changes in main configs > commonConsts.js also
	SCRIPTS: {
		ADPUSHUP_JS: 'ADPUSHUP_JS',
		AMP_DVC: 'AMP_DVC',
		AMP_TYPE_ADPUSHUP: 'AMP_TYPE_ADPUSHUP'
	},
	DEFAULT_VALUES: {
		ADPUSHUP_JS: false,
		AMP_DVC: false,
		AMP_TYPE_ADPUSHUP: false
	}
};

const OUTBRAIN_DISABLED_OPTIONS = [
	{
		label: OUTBRAIN_DISABLED.SCRIPTS.ADPUSHUP_JS,
		value: OUTBRAIN_DISABLED.SCRIPTS.ADPUSHUP_JS
	},
	{
		label: OUTBRAIN_DISABLED.SCRIPTS.AMP_TYPE_ADPUSHUP,
		value: OUTBRAIN_DISABLED.SCRIPTS.AMP_TYPE_ADPUSHUP
	},
	{ label: OUTBRAIN_DISABLED.SCRIPTS.AMP_DVC, value: OUTBRAIN_DISABLED.SCRIPTS.AMP_DVC }
];

const SITE_LEVEL_REFRESH_TYPE = [
	{ name: 'Active View', value: 'Active View' },
	{ name: 'Active Tab', value: 'Active Tab' },
	{ name: 'Background View', value: 'Background View' },
	{ name: 'Background', value: 'Background' }
];

const RULES_ENGINE = {
	RULES_ENGINE_ACTIONS_KEY_OPTIONS: [
		{
			label: 'Refresh Type',
			value: 'refreshType'
		},
		{
			label: 'Refresh Interval',
			value: 'refreshInterval'
		}
	],
	RULES_ENGINE_ACTIONS_VALUE_OPTIONS: {
		refreshType: [
			{ label: 'BG', value: 'BG' },
			{ label: 'AT', value: 'AT' },
			{ label: 'AV', value: 'AV' },
			{ label: 'BV', value: 'BV' }
		],
		refreshInterval: []
	},
	RULE_ENGINE_KEY_OPTIONS_TYPE: {
		RADIO_ELEMENT_TYPES: [],
		NUMBER_ELEMENT_TYPE: ['refreshInterval'],
		DROP_DOWN: ['refreshType'],
		DROP_DOWN_MULTI: []
	},
	RULES_ENGINE_TRIGGER_KEY_OPTIONS: [
		{
			label: 'Country',
			value: 'country'
		},
		{
			label: 'Device',
			value: 'device'
		},
		{
			label: 'Ad Unit',
			value: 'adunit'
		}
	],
	RULES_ENGINE_ACTIONS_KEY_ERRORS: {
		refreshInterval: 'Please also select a Refresh Interval for Refresh Type'
	}
};

const INVENTORY_BULK_ACTIONS = [
	{
		name: 'Enable Collapse Unfilled Impressions',
		value: 'enable-collapseUnfilled'
	},
	{
		name: 'Disable Collapse Unfilled Impressions',
		value: 'disable-collapseUnfilled'
	},
	{
		name: 'Enable Lazy Loading',
		value: 'enable-enableLazyLoading'
	},
	{
		name: 'Disable Lazy Loading',
		value: 'disable-enableLazyLoading'
	},
	{
		name: 'Enable Fluid',
		value: 'enable-fluid'
	},
	{
		name: 'Disable Fluid',
		value: 'disable-fluid'
	},
	{
		name: 'Enable Header Bidding',
		value: 'enable-headerBidding'
	},
	{
		name: 'Disable Header Bidding',
		value: 'disable-headerBidding'
	},
	{
		name: 'Enable Refresh Slot',
		value: 'enable-refreshSlot'
	},
	{
		name: 'Disable Refresh Slot',
		value: 'disable-refreshSlot'
	},
	{
		name: 'Enable Ad',
		value: 'enable-isActive'
	},
	{
		name: 'Disable Ad',
		value: 'disable-isActive'
	},
	{
		name: 'Enable Reuse Vacant Space',
		value: 'disable-disableReuseVacantAdSpace'
	},
	{
		name: 'Disable Reuse Vacant Space',
		value: 'enable-disableReuseVacantAdSpace'
	},
	{
		name: 'Enable Downward Sizes',
		value: 'disable-downwardSizesDisabled'
	},
	{
		name: 'Disable Downward Sizes',
		value: 'enable-downwardSizesDisabled'
	},
	{
		name: 'Enable Destroy Slots on Refresh',
		value: 'enable-isReplaceGptSlotOnRefreshEnabled'
	},
	{
		name: 'Disable Destroy Slots on Refresh',
		value: 'disable-isReplaceGptSlotOnRefreshEnabled'
	}
];

const AD_UNIT_TYPE_MAPPING = {
	1: 'DISPLAY',
	2: 'DOCKED', // javatpoint
	3: 'STICKY', // javatpoint
	// 4: 'AMP', // bollywood shadis , livemint
	5: 'REWARDED ADS', // erail
	6: 'INSTREAM', //  Javatpoint, Journaldev, //this will be not present in inventory filter as it is still in poc
	7: 'CHAINED DOCKED', //  digitbin
	8: 'INTERSTITIAL', // digitbin
	101: 'INVIEW'
};

const FILTER_KEY_VALUE_MAPPING = {
	adUnitType: 'AD Type',
	siteDomain: 'Site Domain',
	siteId: 'Site Id',
	dfpAdunit: 'Ad Unit'
};

const DISCREPANCY_TABLE_COLUMNS = [
	{
		Header: 'Site Id',
		accessor: 'siteId'
	},
	{
		Header: 'Site Domain',
		accessor: 'domain',
		width: 200
	},
	{
		Header: 'Console Email',
		accessor: 'email',
		width: 120
	},
	{
		Header: 'Mg Type',
		accessor: 'mgType'
	},
	{
		Header: 'MG Revenue',
		accessor: 'mgRevenue'
	},
	{
		Header: 'Console Revenue',
		accessor: 'consoleGrossRevenue',
		width: 120
	},
	{
		Header: 'Partner Panel Revenue',
		accessor: 'partnerRevenue',
		width: 200
	},
	{
		Header: 'Console vs Partner',
		accessor: 'consoleVsPartnerDifference',
		width: 170
	},
	{
		Header: 'Console vs Partner Panel %',
		accessor: 'consoleVsPartnerDifferencePercentage',
		width: 200
	},
	{
		Header: 'Partner Panel vs MG Discrepancy',
		accessor: 'mgVsPartnerDifference',
		width: 270
	},
	{
		Header: 'Partner Panel vs MG Discrepancy %',
		accessor: 'mgVsPartnerDifferencePercentage',
		width: 270
	},
	{
		Header: 'Weighted Revenue Share %',
		accessor: 'weightedRevenueShare',
		width: 270
	},
	{
		Header: 'Account Owner',
		accessor: 'accountManagerEmail',
		width: 200
	}
];

const PAYMENT_DISCREPANCY_CSV_PROPERTIES = [
	{ keyName: 'siteId', headerName: 'Site Id' },
	{ keyName: 'domain', headerName: 'Site Domain' },
	{ keyName: 'email', headerName: 'Email' },
	{ keyName: 'mgType', headerName: 'MG Type' },
	{ keyName: 'mgRevenue', headerName: 'MG Revenue' },
	{ keyName: 'consoleGrossRevenue', headerName: 'Console Revenue' },
	{ keyName: 'partnerRevenue', headerName: 'Partner Panel Revenue' },
	{ keyName: 'mgVsPartnerDifference', headerName: 'Partner Panel vs MG Difference' },
	{
		keyName: 'mgVsPartnerDifferencePercentage',
		headerName: 'Partner Panel vs MG Discrepancy %'
	},
	{ keyName: 'consoleVsPartnerDifference', headerName: 'Console vs Partner Difference' },
	{
		keyName: 'consoleVsPartnerDifferencePercentage',
		headerName: 'Console vs Partner Discrepancy'
	},
	{ keyName: 'weightedRevenueShare', headerName: 'Weighted Revenue Share' },
	{ keyName: 'accountManagerEmail', headerName: 'Account Owner' }
];

export {
	adUnitsData,
	adUnitsHeaders,
	OP_NAV_ITEMS,
	OP_NAV_ITEMS_INDEXES,
	OP_NAV_ITEMS_VALUES,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES,
	REPORTS_NAV_ITEMS,
	SITES_MAPPING,
	TABLET_LAYOUT_OPTIONS,
	PAGEGROUP_DEVICE_OPTIONS,
	DFP_ACCOUNTS_DEFAULT,
	GDPR,
	TOOLS_IDENTIFIERS,
	INFO_PANEL_IDENTIFIERS,
	QUICK_SNAPSHOTS_WIDGETS,
	TOP_TEN_SITE_WIDGETS_COLUMNS,
	WIDGETS_INFO,
	ICONS,
	BACKUP_ADS_FORMATS,
	XPATH_MODE_URL,
	SITE_MAPPING_COLUMNS,
	MODE_TOOLTIP_TEXT,
	ERROR_TOOLTIP_TEXT,
	ADPUSHUP_DFP,
	ERROR_REPORT_PROPS,
	PREBID_CURRENCY_URL,
	ADS_TXT_LIVE_SITES_ENTRIES,
	HB_BIDDERS_KEYS_NULL_SHOULD_NOT_BE_NULL,
	REFRESH_RATE_ENTRIES,
	ADS_TXT_LIVE_SITES_STATUS,
	TRIGGER_KEY_OPTIONS,
	TRIGGER_OPERATOR_OPTIONS,
	ACTION_KEY_OPTIONS,
	WEEKDAY,
	WEEKEND,
	GA_ACCESS_EMAIL_OPTIONS,
	GA_VERSION_OPTIONS,
	GA_EVENT_SAMPLING,
	TYPE_TEXT,
	TYPE_NUMBER,
	UNFILLED_REFRESH_RATE_ENTRIES,
	PNP_REPLACE_TYPES,
	AP_LIGHT_AD_UNIT_OPERATIONS,
	PNP_AD_UNIT_OPERATIONS,
	POWERED_BY_BANNER,
	OUTBRAIN_DISABLED,
	OUTBRAIN_DISABLED_OPTIONS,
	RULES_ENGINE,
	INVENTORY_BULK_ACTIONS,
	AD_UNIT_TYPE_MAPPING,
	FILTER_KEY_VALUE_MAPPING,
	SITE_LEVEL_REFRESH_TYPE,
	MG_DEALS_COLUMNS,
	ALL_MONTHS_NAME,
	DISCREPANCY_TABLE_COLUMNS,
	PAYMENT_DISCREPANCY_CSV_PROPERTIES
};
