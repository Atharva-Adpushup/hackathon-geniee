const commonConsts = {
	SELECT: [
		'total_xpath_miss',
		'total_impressions',
		'total_revenue',
		'total_requests',
		'total_gross_revenue',
		'ntwid'
	],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	NETWORK_ID: 'ntwid',
	DEVICE_TYPE: 'device_type',
	DEVICE_TYPE_MAPPING: {
		2: 'desktop',
		4: 'mobile',
		5: 'tablet'
	},
	NETWORKS: {
		adsense: 'adsense',
		adx: 'adx',
		dfp: 'dfp',
		adp: 'Adp'
	},
	LEGEND: ['Impressions', 'CPM ($)'],
	GROUP_BY: ['device_type', 'pagegroup'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: `/data/getVariations`,
	REPORT_DOWNLOAD_ENDPOINT: '/user/reports/downloadAdpushupReport',
	REPORT_STATUS: '/user/reports/status',
	SITE_ID: window.siteId,
	SITE_DOMAIN: window.siteDomain,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.isSuperUser,
	IS_MANUAL: window.isManual,
	DATA_LABELS: {
		date: 'Date',
		pageViews: 'Pageviews',
		pageCpm: 'Page CPM ($)',
		impressions: 'Impressions',
		cpm: 'CPM ($)',
		revenue: 'Revenue ($)',
		grossRevenue: 'Gross Revenue ($)',
		xpathMiss: 'Xpath Miss',
		siteId: 'Siteid',
		name: 'Name',
		variationId: 'Variation Id',
		variation: 'Variation Name',
		pageGroup: 'PageGroup',
		total: 'Total',
		platform: 'Platform',
		adpRequests: 'Adpushup Requests',
		adpCoverage: 'Adpushup Coverage'
	},
	API_DATA_PARAMS: {
		impressions: 'total_impressions',
		pageviews: 'total_requests',
		revenue: 'total_revenue',
		grossRevenue: 'total_gross_revenue',
		xpathMiss: 'total_xpath_miss',
		pageGroup: 'name',
		date: 'report_date',
		variationId: 'variation_id',
		adpRequests: 'total_adp_impressions'
	}
};

export default commonConsts;
