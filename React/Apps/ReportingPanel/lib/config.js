const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'total_requests'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	GROUP_BY: ['pagegroup'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: `/data/getVariations`,
	SITE_ID: 31000, //window.siteId
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
		variationId: 'Variation Id',
		pageGroup: 'PageGroup'
	},
	API_DATA_PARAMS: {
		impressions: 'total_impressions',
		pageviews: 'total_requests',
		revenue: 'total_revenue',
		xpathMiss: 'total_xpath_miss',
		pageGroup: 'name'
	}
};

export default config;
