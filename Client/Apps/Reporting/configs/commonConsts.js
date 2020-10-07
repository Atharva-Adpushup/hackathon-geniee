const REPORTS_NAV_ITEMS_INDEXES = {
	REPORT: 'report',
	URL_UTM_REPORTING: 'url-analytics'
};

const REPORTS_NAV_ITEMS_VALUES = {
	REPORT: 'Report',
	URL_UTM_REPORTING: 'URL Analytics'
};

const REPORTS_NAV_ITEMS = {
	[REPORTS_NAV_ITEMS_INDEXES.REPORT]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.REPORT],
		INDEX: 1
	},
	[REPORTS_NAV_ITEMS_INDEXES.URL_UTM_REPORTING]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.URL_UTM_REPORTING],
		INDEX: 2
	}
};

const ORDER_URL_UTM = {
	HIGHEST_PERFORMING: {
		value: 'top_select_criteria',
		display_name: 'Highest Performing',
		name: 'Highest Performing'
	},
	LOWEST_PERFORMING: {
		value: 'lowest_performing',
		display_name: 'Lowest Performing',
		name: 'Lowest Performing'
	}
};

const optionListForOrderURLAndUTM = [
	ORDER_URL_UTM.HIGHEST_PERFORMING,
	ORDER_URL_UTM.LOWEST_PERFORMING
];

const ORDER_BY_URL_UTM = {
	IMPRESSIONS: { value: 'impressions', display_name: 'Impressions', name: 'Impressions' },
	NET_REVENUE: { value: 'net_revenue', display_name: 'Net Revenue', name: 'Net Revenue' }
	// GROSS_REVENUE: { value: 'GROSS_REVENUE', display_name:'Gross Revenue', name: 'Gross Revenue' },
};

const optionListForOrderByURLAndUTM = [
	ORDER_BY_URL_UTM.IMPRESSIONS,
	ORDER_BY_URL_UTM.NET_REVENUE
	// ORDER_BY_URL_UTM.GROSS_REVENUE
];

const TOTAL_RECORD_LIST_URL_UTM = {
	HUNDRED_FIFTY: { value: '150', display_name: '150', name: '150' },
	THREE_HUNDRED: { value: '300', display_name: '300', name: '300' },
	FIVE_HUNDRED: { value: '500', display_name: '500', name: '500' }
};

const optionListForTotalRecordForURLAndUTM = [
	TOTAL_RECORD_LIST_URL_UTM.HUNDRED_FIFTY,
	TOTAL_RECORD_LIST_URL_UTM.THREE_HUNDRED,
	TOTAL_RECORD_LIST_URL_UTM.FIVE_HUNDRED
];

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

const METRICS_OPS_PANEL = {
	NETWORK_NET_REVENUE: { value: 'network_net_revenue', name: 'Net Revenue', valueType: 'money' },
	ADPUSHUP_PAGE_VIEWS: { value: 'adpushup_page_views', name: 'Page Views', valueType: 'number' },
	ADPUSHUP_PAGE_CPM: { value: 'adpushup_page_cpm', name: 'Page RPM', valueType: 'money' },
	NETWORK_IMPRESSIONS: { value: 'network_impressions', name: 'Impressions', valueType: 'number' },
	NETWORK_AD_ECPM: { value: 'network_ad_ecpm', name: 'Ad eCPM', valueType: 'money' },
	GROSS_REVENUE: { value: 'network_gross_revenue', name: 'Gross Revenue', valueType: 'money' }
};

const displayOpsMetrics = [
	METRICS_OPS_PANEL.NETWORK_NET_REVENUE,
	METRICS_OPS_PANEL.ADPUSHUP_PAGE_VIEWS,
	METRICS_OPS_PANEL.ADPUSHUP_PAGE_CPM,
	METRICS_OPS_PANEL.NETWORK_IMPRESSIONS,
	METRICS_OPS_PANEL.NETWORK_AD_ECPM,
	METRICS_OPS_PANEL.GROSS_REVENUE
];

const UNIQUE_IMPRESSION_METRICS = {
	NETWORK_NET_REVENUE: { value: 'network_net_revenue', name: 'Net Revenue', valueType: 'money' },
	ADPUSHUP_PAGE_VIEWS: { value: 'adpushup_page_views', name: 'Page Views', valueType: 'number' },
	ADPUSHUP_PAGE_CPM: { value: 'adpushup_page_cpm', name: 'Page RPM', valueType: 'money' },
	UNIQUE_IMPRESSIONS: {
		value: 'unique_impressions',
		name: 'Unique Impressions',
		valueType: 'number'
	},
	UNIQUE_AD_ECPM: { value: 'unique_ad_ecpm', name: 'Unique Ad eCPM', valueType: 'money' }
};

const URL_UTM_METRICS = {
	URL: { value: 'url', name: 'URL', valueType: 'url' },
	UTM_PARAM: { value: 'utm_key', name: 'Parameter', valueType: 'url' },
	UTM_VALUE: { value: 'utm_value', name: 'Value', valueType: 'string' },
	UTM_IMPRESSIONS: { value: 'network_impressions', name: 'Impressions', valueType: 'number' },
	UTM_AD_ECPM: { value: 'network_ad_ecpm', name: 'Ad eCPM', valueType: 'money' },
	UTM_NET_REVENUE: { value: 'network_net_revenue', name: 'Revenue', valueType: 'money' },
	URL_IMPRESSIONS: { value: 'network_impressions', name: 'Impressions', valueType: 'number' },
	URL_AD_ECPM: { value: 'network_ad_ecpm', name: 'Ad eCPM', valueType: 'money' },
	URL_NET_REVENUE: { value: 'network_net_revenue', name: 'Net Revenue', valueType: 'money' }
};

const URL_UTM_DIMENSIONS = {
	url: { display_name: 'URL', default_enabled: true, position: 1 },
	utm: { display_name: 'All UTM Parameters', default_enabled: true, position: 2 },
	utm_campaign: { display_name: 'UTM CAMPAIGN', default_enabled: true, position: 3 },
	utm_source: { display_name: 'UTM SOURCE', default_enabled: true, position: 4 },
	utm_medium: { display_name: 'UTM MEDIUM', default_enabled: true, position: 5 },
	utm_term: { display_name: 'UTM TERM', default_enabled: true, position: 6 },
	utm_content: { display_name: 'UTM Content', default_enabled: true, position: 7 },
	utm_camp_src_need: {
		display_name: 'UTM CAMPAIGN+SOURCE+MEDIUM',
		default_enabled: true,
		position: 8
	},
	utm_camp_src: { display_name: 'UTM CAMPAIGN+SOURCE', default_enabled: true, position: 9 }
};

const UTM_METRICS = {
	utm_key: {
		display_name: 'UTM Parameter',
		value: 'utm_key',
		name: 'Parameter',
		valueType: 'url'
	},
	utm_value: { display_name: 'Value', value: 'utm_value', name: 'Value', valueType: 'string' },
	network_impressions: {
		display_name: 'Impressions',
		value: 'network_impressions',
		name: 'Impressions',
		valueType: 'number'
	},
	network_ad_ecpm: {
		display_name: 'Ad ECPM',
		value: 'network_ad_ecpm',
		name: 'Ad eCPM',
		valueType: 'money'
	},
	network_net_revenue: {
		display_name: 'Net Revenue',
		value: 'network_net_revenue',
		name: 'Revenue',
		valueType: 'money'
	}
};

const displayURLMetrics = [
	URL_UTM_METRICS.URL,
	URL_UTM_METRICS.URL_IMPRESSIONS,
	URL_UTM_METRICS.URL_AD_ECPM,
	URL_UTM_METRICS.URL_NET_REVENUE
];

const displayUTMMetrics = [
	URL_UTM_METRICS.UTM_PARAM,
	URL_UTM_METRICS.UTM_VALUE,
	URL_UTM_METRICS.UTM_IMPRESSIONS,
	URL_UTM_METRICS.UTM_AD_ECPM,
	URL_UTM_METRICS.UTM_NET_REVENUE
];

const displayUniqueImpressionMetrics = [
	UNIQUE_IMPRESSION_METRICS.NETWORK_NET_REVENUE,
	UNIQUE_IMPRESSION_METRICS.ADPUSHUP_PAGE_VIEWS,
	UNIQUE_IMPRESSION_METRICS.ADPUSHUP_PAGE_VIEWS,
	UNIQUE_IMPRESSION_METRICS.ADPUSHUP_PAGE_CPM,
	UNIQUE_IMPRESSION_METRICS.UNIQUE_IMPRESSIONS,
	UNIQUE_IMPRESSION_METRICS.UNIQUE_AD_ECPM
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
const opsFilter = ['mode', 'error_code'];
const opsDimension = ['mode', 'error_code'];
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
	'unique_ad_ecpm',
	'adpushup_page_cpm',
	'adpushup_xpath_miss_percent',
	'adpushup_count_percent'
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
	displayOpsMetrics,
	displayUniqueImpressionMetrics,
	optionListForOrderURLAndUTM,
	optionListForOrderByURLAndUTM,
	optionListForTotalRecordForURLAndUTM,
	displayURLMetrics,
	displayUTMMetrics,
	UTM_METRICS,
	URL_UTM_DIMENSIONS,
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
