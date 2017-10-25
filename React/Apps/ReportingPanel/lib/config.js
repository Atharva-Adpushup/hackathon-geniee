const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'total_requests'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	REPORT_ENDPOINT: '/user/reports/generate',
	VARIATIONS_ENDPOINT: '/',
	SITE_ID: 28822, //window.siteId,
	PAGEGROUPS: window.pageGroups,
	IS_SUPERUSER: window.isSuperUser
};

export default config;
