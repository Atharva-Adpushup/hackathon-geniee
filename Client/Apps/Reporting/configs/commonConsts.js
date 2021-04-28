const REPORTS_NAV_ITEMS_INDEXES = {
	REPORT: 'report',
	URL_UTM_REPORTING: 'url-utm-analytics',
	HB_ANALYTICS: 'hb-analytics'
};

const REPORTS_NAV_ITEMS_VALUES = {
	REPORT: 'Report',
	URL_UTM_REPORTING: 'URL/UTM Analytics',
	HB_ANALYTICS: 'HB Analytics'
};

const REPORTS_NAV_ITEMS = {
	[REPORTS_NAV_ITEMS_INDEXES.REPORT]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.REPORT],
		INDEX: 1
	},
	[REPORTS_NAV_ITEMS_INDEXES.URL_UTM_REPORTING]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.URL_UTM_REPORTING],
		INDEX: 2
	},
	[REPORTS_NAV_ITEMS_INDEXES.HB_ANALYTICS]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.HB_ANALYTICS],
		INDEX: 3
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

const EXTRA_METRICS = {
	COUNTRY: { value: 'country', display_name: 'Top Country', name: 'Country', valueType: 'value' },
	DEVICE_TYPE: {
		value: 'device_type',
		display_name: 'Top Devices',
		name: 'Device',
		valueType: 'value'
	},
	topCountries: {
		value: 'topCountries',
		display_name: 'Countries',
		name: 'Country',
		valueType: 'value'
	},
	topDevices: {
		value: 'topDevices',
		display_name: 'Devices',
		name: 'Device',
		valueType: 'value'
	},
	SELECTED_DIMENSION_COLUMN: {
		value: 'selectedDimensionColumn',
		display_name: 'Dimension',
		name: 'selectedDimensionColumn',
		valueType: 'value'
	}
};

const extraMetricsListForHB = [
	EXTRA_METRICS.COUNTRY,
	EXTRA_METRICS.DEVICE_TYPE,
	EXTRA_METRICS.SELECTED_DIMENSION_COLUMN,
	EXTRA_METRICS.topCountries,
	EXTRA_METRICS.topDevices
];

const extraMetricsListMappingForHBArray = [
	EXTRA_METRICS.COUNTRY.value,
	EXTRA_METRICS.DEVICE_TYPE.value,
	EXTRA_METRICS.SELECTED_DIMENSION_COLUMN.value
];

const extraMetricsListMappingForHB = {
	country: EXTRA_METRICS.COUNTRY,
	device_type: EXTRA_METRICS.DEVICE_TYPE
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

const METRICS_OPS_PANEL_XPATH = {
	ADPUSHUP_XPATH_MISS: { value: 'adpushup_xpath_miss', name: 'Net Revenue', valueType: 'number' },
	ADPUSHUP_XPATH_MISS_PERCENT: {
		value: 'adpushup_xpath_miss_percent',
		name: 'Page Views',
		valueType: 'percent'
	},
	ADPUSHUP_IMPRESSION: { value: 'adpushup_impressions', name: 'Page RPM', valueType: 'number' }
};

const displayOpsMetricsForXPath = [
	METRICS_OPS_PANEL_XPATH.ADPUSHUP_XPATH_MISS,
	METRICS_OPS_PANEL_XPATH.ADPUSHUP_XPATH_MISS_PERCENT,
	METRICS_OPS_PANEL_XPATH.ADPUSHUP_IMPRESSION
];

const XPATH_ALLOWED_DIMENSIONS_AND_FILTERS = [
	'network',
	'revenue_channel',
	'ad_format',
	'country',
	'siteid',
	'page_group',
	'page_variation',
	'page_variation_type',
	'device_type',
	'section',
	'ad_unit',
	'ad_unit_type'
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
	utm_camp_src_med: {
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

const HB_METRICS = {
	BID_RATE: { value: 'bid_rate', name: 'Bid Rate', valueType: 'percent', visible: true },
	WIN_RATE_HB: {
		value: 'prebid_win_percent',
		name: 'Win Rate (HB)',
		valueType: 'percent',
		visible: true
	},
	WIN_RATE_OVERALL: {
		value: 'overall_win_percent',
		name: 'Win Rate (overall)',
		valueType: 'percent',
		visible: false
	},
	AVERAGE_WINNING_ECPM_HB: {
		value: 'prebid_win_ecpm',
		name: 'Average Winning eCPM (HB)',
		valueType: 'money',
		visible: false
	},
	AVERAGE_WINNING_ECPM_OVERALL: {
		value: 'overall_win_ecpm',
		name: 'Average Winning eCPM (overall)',
		valueType: 'money',
		visible: false
	},
	AVERAGE_RESPONSE_TIME: {
		value: 'average_response_time',
		name: 'Bid Response Time (Avg)',
		valueType: 'milliseconds',
		visible: true
	},
	REVENUE_GENERATED: {
		value: 'overall_net_revenue',
		name: 'Overall Net Revenue',
		valueType: 'money',
		visible: true
	},
	AVERAGE_REQUEST_ECPM_WIN: {
		value: 'prebid_win_ecpm',
		name: 'Average request eCPM (win)',
		valueType: 'money',
		visible: false
	},
	AVERAGE_REQUEST_ECPM_BID: {
		value: 'prebid_bid_ecpm',
		name: 'Average request eCPM (bid)',
		valueType: 'money',
		visible: false
	},
	PERCENTAGE_OF_TIMEOUTS: {
		value: 'prebid_timeouts_percentage',
		name: 'Percentage of time-outs',
		valueType: 'percent',
		visible: false
	},
	IMPRESSION: {
		value: 'overall_bid_win',
		name: 'Overall Bids Win',
		valueType: 'number',
		visible: true
	},
	COUNTRY: {
		value: 'country',
		name: 'Country',
		display_name: 'Country',
		valueType: 'value',
		visible: true
	},
	DEVICE_TYPE: {
		value: 'device_type',
		name: 'Device Type',
		display_name: 'Device',
		valueType: 'value',
		visible: true
	},
	SELECTED_DIMENSION: {
		value: 'selectedDimension',
		display_name: '',
		name: 'selectedDimension',
		valueType: 'value',
		visible: false
	}
};

const displayHBMetrics = [
	HB_METRICS.BID_RATE,
	HB_METRICS.WIN_RATE_HB,
	HB_METRICS.WIN_RATE_OVERALL,
	HB_METRICS.AVERAGE_WINNING_ECPM_HB,
	HB_METRICS.AVERAGE_WINNING_ECPM_OVERALL,
	HB_METRICS.AVERAGE_RESPONSE_TIME,
	HB_METRICS.REVENUE_GENERATED,
	HB_METRICS.AVERAGE_REQUEST_ECPM_WIN,
	HB_METRICS.AVERAGE_REQUEST_ECPM_BID,
	HB_METRICS.PERCENTAGE_OF_TIMEOUTS,
	HB_METRICS.IMPRESSION,
	HB_METRICS.COUNTRY,
	HB_METRICS.DEVICE_TYPE,
	HB_METRICS.SELECTED_DIMENSION
];

const HB_CHART = {
	PREBID_WIN_ECPM: {
		value: 'prebid_win_ecpm',
		type: 'line',
		nameId: 'prebid_win_ecpm',
		caption: "When a bidder wins - what's the average eCPM?",
		details:
			'Line chart with each line depicting the eCPM variation for each bidder over the chosen period.',
		position: 6,
		name: 'Winning eCPM(HB)',
		valueType: 'money',
		visible: true
	},
	OVERALL_WIN_RATE: {
		value: 'overall_win_percent',
		type: 'line',
		nameId: 'overall_win_percent',
		caption: 'How often does each bidder win the complete auction?',
		details: 'Line chart with a percentage win rate trend per bidder',
		position: 5,
		name: 'Win Rate(overall)',
		valueType: 'percent',
		visible: false
	},
	BID_RATE: {
		value: 'bid_rate',
		type: 'line',
		nameId: 'bid_rate',
		caption: 'How often does each bidder bid?',
		details: 'Line chart with a percentage bid rate trend per bidder',
		position: 3,
		name: 'Bid Rate',
		valueType: 'percent',
		visible: false
	},
	OVERALL_BID_ECPM: {
		value: 'overall_win_ecpm',
		type: 'line',
		nameId: 'overall_win_ecpm',
		caption: 'Average Bid eCPM for bidders',
		details:
			'Line chart with each line depicting the eCPM (mid-80% range) variation for each bidder over the chosen period.',
		position: 1,
		name: 'Average Bid eCPM',
		valueType: 'money',
		visible: true
	},
	PREBID_WIN_PERCENTAGE: {
		value: 'prebid_win_percent',
		type: 'pie',
		nameId: 'prebid_win_percent',
		caption: 'How often does each bidder win the overall auction?',
		details: 'Pie chart (sorted by values) showing how often a bidder won.',
		position: 2,
		name: 'Win Percentage(HB)',
		valueType: 'percent',
		visible: true
	},
	BIDDER_RESPONSE_TIME: {
		value: 'average_response_time',
		type: 'line',
		nameId: 'average_response_time',
		caption: 'How much time does each bidder take to respond with a bid?',
		details:
			'Line chart with each line depicting the average (mid-80%) bid response time for each bidder over the chosen period.',
		position: 7,
		name: 'Response Time',
		valueType: 'milliseconds',
		visible: true
	},
	PREBID_WIN_RATE: {
		value: 'prebid_win_percent',
		type: 'line',
		nameId: 'prebid_win_percent',
		caption: 'How often does this bidder win the HB auction?',
		details: 'Line chart with a percentage win rate trend per bidder',
		position: 4,
		name: 'Win Rate(HB)',
		valueType: 'percent',
		visible: false
	},
	BIDDER_TIMEOUT_PERCENTAGE: {
		value: 'prebid_timeouts_percentage',
		type: 'line',
		nameId: 'prebid_timeouts_percentage',
		caption: 'How often does the bidder get timed out?',
		details: 'Line chart with the average percentage of time-outs per bidder for the chosen period',
		position: 10,
		name: 'Timed-out Percentage',
		valueType: 'percent',
		visible: false
	}
};

const displayHBCharts = [
	HB_CHART.PREBID_WIN_ECPM,
	HB_CHART.OVERALL_WIN_RATE,
	HB_CHART.BID_RATE,
	HB_CHART.OVERALL_BID_ECPM,
	HB_CHART.PREBID_WIN_PERCENTAGE,
	HB_CHART.BIDDER_RESPONSE_TIME,
	HB_CHART.PREBID_WIN_RATE,
	HB_CHART.BIDDER_TIMEOUT_PERCENTAGE
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
	'adpushup_count_percent',
	'country',
	'device_type',
	'prebid_win_percent',
	'bid_rate',
	'prebid_timeouts_percentage',
	'prebid_bid_ecpm',
	'prebid_win_ecpm',
	'overall_win_percent',
	'overall_win_ecpm',
	'topCountries',
	'topDevices',
	'selectedDimensionColumn',
	'average_response_time'
];

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please contact AdPushup Ops';

const PIVOT = 'network';
const MUST_HAVE_COLS = ['country', 'device_type'];
const BID_CPM_STATS_BUCKET_MODE = 0.05;

const ANOMALY_THRESHOLD_CONSTANT = {
	eCPM: 5,
	RESPONSE_TIME: 3000,
	PERCENT: 100
};

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
	displayOpsMetricsForXPath,
	displayUniqueImpressionMetrics,
	extraMetricsListForHB,
	extraMetricsListMappingForHB,
	extraMetricsListMappingForHBArray,
	displayHBMetrics,
	displayHBCharts,
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
	REPORT_TYPE,
	DEFAULT_ERROR_MESSAGE,
	PIVOT,
	MUST_HAVE_COLS,
	BID_CPM_STATS_BUCKET_MODE,
	ANOMALY_THRESHOLD_CONSTANT,
	XPATH_ALLOWED_DIMENSIONS_AND_FILTERS
};
