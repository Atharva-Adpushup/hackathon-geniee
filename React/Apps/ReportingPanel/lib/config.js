const config = {
	SELECT: ['total_xpath_miss', 'total_impressions', 'total_cpm'],
	PLATFORMS: ['DESKTOP', 'MOBILE', 'TABLET'],
	API_ENDPOINT: '/user/reports/generate',
	SITE_ID: window.siteId
};

export default config;
