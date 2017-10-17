const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	API_ENDPOINT: '/user/reports/generate',
	SITE_ID: window.siteId,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.IS_SUPERUSER
};

export default config;
