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
	REVENUE: 'Revenue',
	UNIQUE_ECPM: 'Unique eCPM'
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
		Header: 'Sr No.',
		accessor: 'serialNumber' // accessor is the "key" in the data
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

const MG_DEAL_TYPES = {
	PAGE_RPM: {
		displayName: 'Page RPM'
	},
	REVENUE: {
		displayName: 'Revenue'
	},
	eCPM: {
		displayName: 'eCPM'
	},
	UNIQUE_ECPM: {
		displayName: 'Unique eCPM'
	}
};

const MG_DEAL_DROPDOWN_HEADING = 'Set MG Type';

const MG_DEAL_ERROR_MESSAGES = {
	invalidAmountError: 'Amount value cannot be greater than 3 figure digits'
};

const MG_DEAL_ALERT_MESSAGES = {
	createAlertMessage: 'Are you sure you want to create this deal?',
	updateAlertMessage: 'Are you sure you want to update this deal?',
	deleteAlertMessage: 'Are you sure you want to delete this deal?'
};

const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

const DEAL_CREATION_ACTIONS = {
	CREATE_MGDEAL: 'create',
	EDIT_MGDEAL: 'edit',
	DELETE_MGDEAL: 'delete'
};

export {
	PAYMENT_NAV_ITEMS,
	PAYMENT_NAV_ITEMS_INDEXES,
	PAYMENT_NAV_ITEMS_VALUES,
	MG_TYPES,
	MG_START_YEAR,
	MG_DEALS_TABLE_COLUMNS,
	MG_DEAL_TYPES,
	DISCREPANCY_START_YEAR,
	MG_DEAL_DROPDOWN_HEADING,
	MG_DEAL_ERROR_MESSAGES,
	MG_DEAL_ALERT_MESSAGES,
	MONTH_NAMES,
	DEAL_CREATION_ACTIONS
};
