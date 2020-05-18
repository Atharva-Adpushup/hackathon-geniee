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

const activeLegendItemArray = [
	{ value: 'adpushup_variation_page_cpm', name: 'AdPushup Variation Page RPM', valueType: 'money' },
	{ value: 'original_variation_page_cpm', name: 'Original Variation Page RPM', valueType: 'number' }
];

const dates = [
	{ value: 'today', name: 'Today' },
	{ value: 'yesterday', name: 'Yesterday' },
	{ value: 'last7Days', name: 'Last 7 Days' },
	{ value: 'last30Days', name: 'Last 30 Days' },
	{ value: 'month', name: 'This Month' },
	{ value: 'lastMonth', name: 'Last Month' },
	{ value: 'customDateRange', name: 'Custom Date Range' }
];
const DEFAULT_DATE = dates[2].value;
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
const yAxisGroups = [
	{
		seriesNames: ['AdPushup Variation Page RPM', 'Original Variation Page RPM'],
		yAxisConfig: {
			labels: {
				// eslint-disable-next-line no-template-curly-in-string
				format: '${value}'
			}
		}
	}
];
const tableHeader = [
	{ title: 'Website', prop: 'siteName' },
	{ title: 'AdPushup Page views', prop: 'adpushup_page_views' },
	{ title: 'Page RPM ($)', prop: 'page_cpm' },
	{ title: 'AdPushup Impressions', prop: 'adpushup_impressions' },
	{ title: 'Ad eCPM', prop: 'ad_ecpm' },
	{ title: 'Network Net Revenue', prop: 'network_net_revenue' },
	{ title: 'Network Gross Revenue', prop: 'network_gross_revenue' },
	{ title: 'XPath Miss', prop: 'adpushup_xpath_miss' }
];

const displayMetrics = {
	network_gross_revenue: { name: 'Gross Revenue', valueType: 'money' },
	network_net_revenue: { name: 'Net Revenue', valueType: 'money' },
	adpushup_page_views: { name: 'Page Views', valueType: 'number' },
	adpushup_page_cpm: { name: 'Page RPM', valueType: 'money' },
	network_impressions: { name: 'Impressions', valueType: 'number' },
	network_ad_ecpm: { name: 'Ad eCPM', valueType: 'money' }
};

const opsDisplayMetricsKeys = ['network_gross_revenue'];

const dashboardWidgets = [
	'per_site_wise',
	'estimated_earnings',
	'rev_by_network',
	'per_overview',
	'per_ap_original',
	'ops_country_report'
];

const ALL_SITES_VALUE = { name: 'All', value: 'all' };

const REPORT_LINK = {
	ACCOUNT: 'report-vitals',
	GLOBAL: 'global-report-vitals'
};

export {
	DASHBOARD_NAV_ITEMS_INDEXES,
	DASHBOARD_NAV_ITEMS_VALUES,
	DASHBOARD_NAV_ITEMS,
	dates,
	DEFAULT_DATE,
	sites,
	ALL_SITES_VALUE,
	yAxisGroups,
	tableHeader,
	displayMetrics,
	opsDisplayMetricsKeys,
	dashboardWidgets,
	activeLegendItemArray,
	REPORT_LINK
};
