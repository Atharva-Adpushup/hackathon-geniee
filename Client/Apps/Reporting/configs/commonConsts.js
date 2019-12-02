const REPORTS_NAV_ITEMS_INDEXES = {
	SITE: 'site',
	ACCOUNT: 'account'
};

const REPORTS_NAV_ITEMS_VALUES = {
	SITE: 'Site-wise',
	ACCOUNT: 'Account'
};

const REPORTS_NAV_ITEMS = {
	[REPORTS_NAV_ITEMS_INDEXES.SITE]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.SITE],
		INDEX: 2
	},
	[REPORTS_NAV_ITEMS_INDEXES.ACCOUNT]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.ACCOUNT],
		INDEX: 1
	}
};

const dimensions = {
	site: { display_name: 'Site' },
	device: { display_name: 'Device Type' },
	bidder: { display_name: 'Bidder' },
	country: { display_name: 'Country' },
	demand: { display_name: 'Demand Source' },
	days: { display_name: 'Days' },
	weeks: { display_name: 'Weeks' },
	months: { display_name: 'Months' },
	cummulative: { display_name: 'Cummulative' }
};

const filters = {
	site: { display_name: 'Site' },
	device: { display_name: 'Device Type' },
	bidder: { display_name: 'Bidder' }
};

const filtersValues = {
	site: [
		{
			id: 1,
			value: 'abc.com'
		},
		{
			id: 2,
			value: 'pqr.com'
		},
		{
			id: 3,
			value: 'xyz.com'
		}
	],
	device: [
		{
			id: 1,
			value: 'Desktop'
		},
		{
			id: 2,
			value: 'Mobile'
		},
		{
			id: 3,
			value: 'Tablet'
		}
	],
	bidder: [
		{
			id: 1,
			value: 'C1X'
		},
		{
			id: 2,
			value: 'Criteo'
		},
		{
			id: 3,
			value: 'Pubmatic'
		}
	]
};
const REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

const REPORT_DOWNLOAD_ENDPOINT = '/api/reports/downloadAdpushupReport';
const REPORT_STATUS = '/api/reports/getLastUpdateStatus';

const TERMS = {
	PAGE_VARIATION_TYPE: 'page_variation_type',
	PAGE_VARIATION: 'page_variation',
	PAGEGROUP: 'page_group',
	SECTION: 'section'
};

const METRICS = {
	NETWORK_NET_REVENUE: { value: 'network_net_revenue', name: 'Net Revenue', valueType: 'money' },
	ADPUSHUP_PAGE_VIEWS: { value: 'adpushup_page_views', name: 'Page Views', valueType: 'number' },
	ADPUSHUP_PAGE_CPM: { value: 'adpushup_page_cpm', name: 'Page RPM', valueType: 'money' },
	NETWORK_IMPRESSIONS: { value: 'network_impressions', name: 'Impressions', valueType: 'number' },
	NETWORK_AD_ECPM: { value: 'network_ad_ecpm', name: 'Ad eCPM', valueType: 'money' }
};

const displayMetrics = [
	METRICS.NETWORK_NET_REVENUE,
	METRICS.ADPUSHUP_PAGE_VIEWS,
	METRICS.ADPUSHUP_PAGE_CPM,
	METRICS.NETWORK_IMPRESSIONS,
	METRICS.NETWORK_AD_ECPM
];
const activeLegendItem = METRICS.NETWORK_NET_REVENUE;
const activeLegendItemArray = [
	METRICS.NETWORK_NET_REVENUE,
	METRICS.ADPUSHUP_PAGE_VIEWS,
	METRICS.ADPUSHUP_PAGE_CPM
];
const accountFilter = ['siteid', 'device_type', 'network'];
const accountDisableFilter = [
	TERMS.PAGE_VARIATION_TYPE,
	TERMS.PAGE_VARIATION,
	TERMS.PAGEGROUP,
	TERMS.SECTION
];
const opsFilter = ['mode', 'error_code', 'country'];
const opsDimension = ['mode', 'error_code', 'country'];
const accountDimension = ['siteid', 'device_type', 'network'];
const accountDisableDimension = [
	TERMS.PAGE_VARIATION_TYPE,
	TERMS.PAGE_VARIATION,
	TERMS.PAGEGROUP,
	TERMS.SECTION
];
const REPORT_INTERVAL_TABLE_KEYS = ['date', 'month', 'year'];
const AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY = 'ap-reporting-active-chart-legends';

const REPORT_TYPE = {
	GLOBAL: 'global',
	ACCOUNT: 'account',
	SITE: 'site'
};

const columnsBlacklistedForAddition = [
	'adpushup_ad_ecpm',
	'network_ad_ecpm',
	'adpushup_page_cpm',
	'adpushup_xpath_miss_percent'
];

export {
	REPORTS_NAV_ITEMS,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES,
	dimensions,
	filters,
	filtersValues,
	REPORT_PATH,
	displayMetrics,
	activeLegendItem,
	activeLegendItemArray,
	accountFilter,
	accountDimension,
	accountDisableFilter,
	accountDisableDimension,
	columnsBlacklistedForAddition,
	REPORT_INTERVAL_TABLE_KEYS,
	opsDimension,
	opsFilter,
	REPORT_DOWNLOAD_ENDPOINT,
	REPORT_STATUS,
	AP_REPORTING_ACTIVE_CHART_LEGENDS_STORAGE_KEY,
	TERMS,
	METRICS,
	REPORT_TYPE
};
