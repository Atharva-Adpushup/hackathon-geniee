const DASHBOARD_NAV_ITEMS_INDEXES = {
	ESTIMATED_EARNINGS: 1,
	PERFORMANCE: 2,
	REVENUE: 3,
	SITEWISE_REPORTS: 4
};

const DASHBOARD_NAV_ITEMS_VALUES = {
	ESTIMATED_EARNINGS: 'Estimated Earnings',
	PERFORMANCE: 'Performance',
	REVENUE: 'Revenue',
	SITEWISE_REPORTS: 'Sitewise Reports'
};

const DASHBOARD_NAV_ITEMS = {
	[DASHBOARD_NAV_ITEMS_INDEXES.ESTIMATED_EARNINGS]: {
		NAME: [DASHBOARD_NAV_ITEMS_VALUES.ESTIMATED_EARNINGS],
		INDEX: 1
	},
	[DASHBOARD_NAV_ITEMS_INDEXES.PERFORMANCE]: {
		NAME: [DASHBOARD_NAV_ITEMS_VALUES.PERFORMANCE],
		INDEX: 2
	},
	[DASHBOARD_NAV_ITEMS_INDEXES.REVENUE]: {
		NAME: [DASHBOARD_NAV_ITEMS_VALUES.REVENUE],
		INDEX: 3
	},
	[DASHBOARD_NAV_ITEMS_INDEXES.SITEWISE_REPORTS]: {
		NAME: [DASHBOARD_NAV_ITEMS_VALUES.SITEWISE_REPORTS],
		INDEX: 4
	}
};

const quickDates = [
	{ value: 'last7Days', name: 'Last 7 Days' },
	{ value: 'last30Days', name: 'Last 30 Days' },
	{ value: 'month', name: 'This Month' }
];
const sites = [
	{
		value: 1,
		name: 'abc.com'
	},
	{
		value: 2,
		name: 'pqr.com'
	},
	{
		value: 3,
		name: 'xyz.com'
	}
];

export {
	DASHBOARD_NAV_ITEMS_INDEXES,
	DASHBOARD_NAV_ITEMS_VALUES,
	DASHBOARD_NAV_ITEMS,
	quickDates,
	sites
};
