const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: '/',
	SITE_ID: window.siteId,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.isSuperUser
};

export default config;
