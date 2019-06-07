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

export {
	OP_NAV_ITEMS,
	OP_NAV_ITEMS_INDEXES,
	OP_NAV_ITEMS_VALUES,
	SITES_MAPPING,
	TABLET_LAYOUT_OPTIONS,
	PAGEGROUP_DEVICE_OPTIONS
};
