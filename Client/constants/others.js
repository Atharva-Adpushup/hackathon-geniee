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
	SIDEBAR_CLOSE: [/admin-panel.*/, /innovative-ads.*/]
};

const DEMO_ACCOUNT_DATA = {
	EMAIL: 'demo@adpushup.com',
	DEFAULT_SITE: {
		NAME: 'example.com',
		SITE_ID: '37780'
	},
	SITES: {
		38903: 'https://www.iaai.com/',
		29752: 'https://www.ccna7.com/',
		37780: 'https://www.javatpoint.com/',
		25019: 'http://rentdigs.com/'
	}
};

const REPORT_TYPE = {
	GLOBAL: 'global',
	ACCOUNT: 'account',
	SITE: 'site'
};

export { ADSTXT_SITE_LIST_HEADERS, ADSTXT_STATUS, ROUTES, DEMO_ACCOUNT_DATA, REPORT_TYPE };
