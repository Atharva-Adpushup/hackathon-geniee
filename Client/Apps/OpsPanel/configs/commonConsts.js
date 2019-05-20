// OP abbreviation stands for Ops Panel
const OP_NAV_ITEMS_INDEXES = {
	SITES_MAPPING: 'all-sites',
	LIVE_SITES_MAPPING: 'live-sites'
};

const OP_NAV_ITEMS_VALUES = {
	SITES_MAPPING: 'All Sites',
	LIVE_SITES_MAPPING: 'Live Sites'
};

const OP_NAV_ITEMS = {
	[OP_NAV_ITEMS_INDEXES.SITES_MAPPING]: {
		NAME: [OP_NAV_ITEMS_VALUES.SITES_MAPPING],
		INDEX: 1
	},
	[OP_NAV_ITEMS_INDEXES.LIVE_SITES_MAPPING]: {
		NAME: [OP_NAV_ITEMS_VALUES.LIVE_SITES_MAPPING],
		INDEX: 2
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

export { OP_NAV_ITEMS, OP_NAV_ITEMS_INDEXES, OP_NAV_ITEMS_VALUES, SITES_MAPPING };
