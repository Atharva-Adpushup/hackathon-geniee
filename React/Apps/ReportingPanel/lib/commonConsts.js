const commonConsts = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'total_requests', 'total_gross_revenue'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	GROUP_BY: ['pagegroup'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: `/data/getVariations`,
	SITE_ID: 31000, //window.siteId,
	SITE_DOMAIN: window.siteDomain,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.isSuperUser,
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
		total: 'Total'
	},
	API_DATA_PARAMS: {
		impressions: 'total_impressions',
		pageviews: 'total_requests',
		revenue: 'total_revenue',
		grossRevenue: 'total_gross_revenue',
		xpathMiss: 'total_xpath_miss',
		pageGroup: 'name',
		date: 'report_date',
		variationId: 'variation_id'
	}
};

export default commonConsts;
