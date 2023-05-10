const PAYMENT_NAV_ITEMS_INDEXES = {
	DETAILS: 'details',
	HISTORY: 'history',
	BALANCE: 'Balance',
	MG_DEALS: 'MG Deals'
};

const PAYMENT_NAV_ITEMS_VALUES = {
	DETAILS: 'Details',
	HISTORY: 'History',
	BALANCE: 'Balance',
	MG_DEALS: 'MG Deals'
};

const MG_TYPES = {
	PAGE_RPM: 'Page RPM',
	ECPM: 'eCPM',
	REVENUE: 'Revenue'
};

const MG_START_YEAR = 2022;
const DISCREPANCY_START_YEAR = 2022;

const PAYMENT_NAV_ITEMS = {
	[PAYMENT_NAV_ITEMS_INDEXES.DETAILS]: {
		NAME: [PAYMENT_NAV_ITEMS_VALUES.DETAILS],
		INDEX: 1
	},
	[PAYMENT_NAV_ITEMS_INDEXES.HISTORY]: {
		NAME: [PAYMENT_NAV_ITEMS_VALUES.HISTORY],
		INDEX: 2
	},
	[PAYMENT_NAV_ITEMS_INDEXES.BALANCE]: {
		NAME: [PAYMENT_NAV_ITEMS_VALUES.BALANCE],
		INDEX: 3
	},
	[PAYMENT_NAV_ITEMS_INDEXES.MG_DEALS]: {
		NAME: [PAYMENT_NAV_ITEMS_VALUES.MG_DEALS],
		INDEX: 4
	}
};
const MG_DEALS_TABLE_COLUMNS = [
	{
		Header: 'MG Deal I D',
		accessor: 'id' // accessor is the "key" in the data
	},
	{
		Header: 'Start Date',
		accessor: 'startDate' // accessor is the "key" in the data
	},
	{
		Header: 'End Date',
		accessor: 'endDate' // accessor is the "key" in the data
	},
	{
		Header: 'View',
		accessor: 'view' // accessor is the "key" in the data
	}
];
const MG_DEAL_TYPES = ['Page RPM', 'Revenue', 'eCPM', 'Unique eCPM'];

export {
	PAYMENT_NAV_ITEMS,
	PAYMENT_NAV_ITEMS_INDEXES,
	PAYMENT_NAV_ITEMS_VALUES,
	MG_TYPES,
	MG_START_YEAR,
	MG_DEALS_TABLE_COLUMNS,
	MG_DEAL_TYPES,
	DISCREPANCY_START_YEAR
};
