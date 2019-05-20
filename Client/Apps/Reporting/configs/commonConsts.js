const REPORTS_NAV_ITEMS_INDEXES = {
	SITE: 'site',
	ACCOUNT: 'account'
};

const REPORTS_NAV_ITEMS_VALUES = {
	SITE: 'Site-wise',
	ACCOUNT: 'Account'
};

const REPORTS_NAV_ITEMS = {
	[REPORTS_NAV_ITEMS_INDEXES.SITE]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.SITE],
		INDEX: 2
	},
	[REPORTS_NAV_ITEMS_INDEXES.ACCOUNT]: {
		NAME: [REPORTS_NAV_ITEMS_VALUES.ACCOUNT],
		INDEX: 1
	}
};

const dimensions = {
	site: { display_name: 'Site' },
	device: { display_name: 'Device Type' },
	bidder: { display_name: 'Bidder' },
	country: { display_name: 'Country' },
	demand: { display_name: 'Demand Source' },
	days: { display_name: 'Days' },
	weeks: { display_name: 'Weeks' },
	months: { display_name: 'Months' },
	cummulative: { display_name: 'Cummulative' }
};

const filters = {
	site: { display_name: 'Site' },
	device: { display_name: 'Device Type' },
	bidder: { display_name: 'Bidder' }
};

const filtersValues = {
	site: [
		{
			id: 1,
			value: 'abc.com'
		},
		{
			id: 2,
			value: 'pqr.com'
		},
		{
			id: 3,
			value: 'xyz.com'
		}
	],
	device: [
		{
			id: 1,
			value: 'Desktop'
		},
		{
			id: 2,
			value: 'Mobile'
		},
		{
			id: 3,
			value: 'Tablet'
		}
	],
	bidder: [
		{
			id: 1,
			value: 'C1X'
		},
		{
			id: 2,
			value: 'Criteo'
		},
		{
			id: 3,
			value: 'Pubmatic'
		}
	]
};
const REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

export {
	REPORTS_NAV_ITEMS,
	REPORTS_NAV_ITEMS_INDEXES,
	REPORTS_NAV_ITEMS_VALUES,
	dimensions,
	filters,
	filtersValues,
	REPORT_PATH
};
