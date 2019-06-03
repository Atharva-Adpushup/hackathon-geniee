const ADSTXT_SITE_LIST_HEADERS = [
	{ displayText: 'Domain', key: 'Domain' },
	{ displayText: 'Status', key: 'status' },
	{ displayText: 'Action', key: 'action' }
];

const ADSTXT_STATUS = {
	0: 'Entries Upto Date',
	1: 'Missing Entries',
	2: 'No Entries Found',
	3: 'No Ads.txt Found'
};

const ROUTES = {
	BLACK_LIST: ['/addSite', '/onboarding', '/dashboard'],
	DYNAMIC_PARAMS: [':siteId'],
	SIDEBAR_CLOSE: [/ops-panel.*/]
};

export { ADSTXT_SITE_LIST_HEADERS, ADSTXT_STATUS, ROUTES };
