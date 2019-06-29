// OP abbreviation stands for Ops Panel
const OP_NAV_ITEMS_INDEXES = {
	SETTINGS: 'settings',
	INFO_PANEL: 'info-panel',
	SITES_MAPPING: 'sites-mapping',
	TOOLS: 'tools'
};

const OP_NAV_ITEMS_VALUES = {
	SETTINGS: 'Settings',
	INFO_PANEL: 'Info Panel',
	SITES_MAPPING: 'Sites Mapping',
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
		value: '103512698-103512698'
	}
];

const TOOLS_IDENTIFIERS = {
	BACKUP_ADS: 'BACKUP_ADS',
	ENABLE_HB_BIDDER: 'ENABLE_HB_BIDDER',
	REGEX_VERIFICATION: 'REGEX_VERIFICATION',
	REGEX_GENERATION: 'REGEX_GENERATION'
};

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
	ICONS
};
