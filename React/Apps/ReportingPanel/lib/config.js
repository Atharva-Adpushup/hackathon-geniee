const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'total_requests'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: `/data/getVariations`,
	SITE_ID: window.siteId,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.isSuperUser,
	DATA_LABELS: {
		date: 'Date',
		pageViews: 'Pageviews',
		pageCpm: 'Page CPM ($)',
		impressions: 'Impressions',
		cpm: 'CPM ($)',
		revenue: 'Revenue ($)',
		xpathMiss: 'Xpath Miss',
		siteId: 'Siteid',
		name: 'Name',
		variationId: 'Variation Id'
	}
};

export default config;
