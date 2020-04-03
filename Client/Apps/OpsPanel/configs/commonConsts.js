import React from 'react';
// OP abbreviation stands for Ops Panel
const OP_NAV_ITEMS_INDEXES = {
	SETTINGS: 'settings',
	INFO_PANEL: 'info-panel',
	INFO_PANEL_QUICK_SNAPSHOT: 'QUICK_SNAPSHOT',
	INFO_PANEL_REPORT_VITALS: 'REPORT_VITALS',
	INFO_PANEL_GLOBAL_REPORT_VITALS: 'GLOBAL_REPORT_VITALS',
	SITES_MAPPING: 'sites-mapping',
	TOOLS: 'tools'
};

const OP_NAV_ITEMS_VALUES = {
	SETTINGS: 'Settings',
	INFO_PANEL: 'Info Panel',
	SITES_MAPPING: 'Site Mapping',
	TOOLS: 'Tools'
};

const OP_NAV_ITEMS = {
	[OP_NAV_ITEMS_INDEXES.SETTINGS]: {
		NAME: [OP_NAV_ITEMS_VALUES.SETTINGS],
		INDEX: 1
	},
	[OP_NAV_ITEMS_INDEXES.INFO_PANEL]: {
		NAME: [OP_NAV_ITEMS_VALUES.INFO_PANEL],
		INDEX: 2
	},
	[OP_NAV_ITEMS_INDEXES.SITES_MAPPING]: {
		NAME: [OP_NAV_ITEMS_VALUES.SITES_MAPPING],
		INDEX: 3
	},
	[OP_NAV_ITEMS_INDEXES.TOOLS]: {
		NAME: [OP_NAV_ITEMS_VALUES.TOOLS],
		INDEX: 4
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
		value: '103512698-103512698-USD'
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
	ADS_TXT_LIVE_SITES: 'ADS_TXT_LIVE_SITES'
};

const ADS_TXT_LIVE_SITES_ENTRIES = [
	{ name: 'Missing Entries', value: 'Missing Entries' },
	{ name: 'Present Entries', value: 'Present Entries' },
	{ name: 'Global Entries', value: 'Global Entries' },
	{ name: 'No Ads.Txt Present', value: 'No Ads.Txt Present' }
];

const INFO_PANEL_IDENTIFIERS = {
	QUICK_SNAPSHOT: 'QUICK_SNAPSHOT',
	REPORT_VITALS: 'REPORT_VITALS',
	GLOBAL_REPORT_VITALS: 'GLOBAL_REPORT_VITALS'
};

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
	modes: [{ name: 'Mode 1', value: 1 }, { name: 'Mode 2', value: 2 }],
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
	{ name: '30 seconds', value: 30 },
	{ name: '60 seconds', value: 60 },
	{ name: '90 seconds', value: 90 },
	{ name: '120 seconds', value: 120 },
	{ name: '180 seconds', value: 180 },
	{ name: '240 seconds', value: 240 },
	{ name: '300 seconds', value: 300 },
	{ name: '360 seconds', value: 360 }
];

export {
	OP_NAV_ITEMS,
	OP_NAV_ITEMS_INDEXES,
	OP_NAV_ITEMS_VALUES,
	SITES_MAPPING,
	TABLET_LAYOUT_OPTIONS,
	PAGEGROUP_DEVICE_OPTIONS,
	DFP_ACCOUNTS_DEFAULT,
	GDPR,
	TOOLS_IDENTIFIERS,
	INFO_PANEL_IDENTIFIERS,
	QUICK_SNAPSHOTS_WIDGETS,
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
	REFRESH_RATE_ENTRIES
};
