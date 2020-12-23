const GLOBAL_ACTIONS = {
	FETCH_GLOBAL_DATA: 'FETCH_GLOBAL_DATA',
	REPLACE_NETWORK_TREE: 'REPLACE_NETWORK_TREE'
};
const USER_ACTIONS = {
	LOGOUT_USER: 'LOGOUT_USER',
	REPLACE_USER_DATA: 'REPLACE_USER_DATA',
	UPDATE_AD_NETWORK_SETTINGS: 'UPDATE_AD_NETWORK_SETTINGS',
	RESET_STATE: 'RESET_STATE',
	UPDATE_USER: 'UPDATE_USER',
	OVERRIDE_OPS_PANEL_VALUE: 'OVERRIDE_OPS_PANEL_VALUE'
};
const NETWORK_CONFIG_ACTIONS = {
	REPLACE_NETWORK_CONFIG: 'REPLACE_NETWORK_CONFIG'
};

const ADS_TXT_ACTIONS = {
	REPLACE_ADS_TXT: 'REPLACE_ADS_TXT'
};

const URL_REPORTS_ACTIONS = {
	REPLACE_GLOBAL_URL_REPORTS_DATA: 'REPLACE_GLOBAL_URL_REPORTS_DATA',
	REPLACE_ACCOUNT_URL_REPORTS_DATA: 'REPLACE_ACCOUNT_URL_REPORTS_DATA'
};
const REPORTS_ACTIONS = {
	REPLACE_GLOBAL_REPORT_DATA: 'REPLACE_GLOBAL_REPORT_DATA',
	REPLACE_ACCOUNT_REPORT_DATA: 'REPLACE_ACCOUNT_REPORT_DATA'
};
const SITE_ACTIONS = {
	REPLACE_SITE_DATA: 'REPLACE_SITE_DATA',
	UPDATE_SITE_DATA: 'UPDATE_SITE_DATA',
	UPDATE_SITE_STEP: 'UPDATE_SITE_STEP',
	UPDATE_SITE_APCONFIG: 'UPDATE_SITE_APCONFIG',
	UPDATE_SITE_DATA_KEY_OBJ: 'UPDATE_SITE_DATA_KEY_OBJ',
	UPDATE_SITE_DATA_KEY_ARRAY: 'UPDATE_SITE_DATA_KEY_ARRAY',
	UPDATE_SITE_INVENTORIES: 'UPDATE_SITE_INVENTORIES'
};
const UI_ACTIONS = {
	HIDE_NOTIFICATION: 'HIDE_NOTIFICATION',
	SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
	HIDE_COPIED_NOTIFICATION: 'HIDE_COPIED_NOTIFICATION',
	SHOW_COPIED_NOTIFICATION: 'SHOW_COPIED_NOTIFICATION'
};

const NOTIFICATION_ACTIONS = {
	REPLACE_NOTIFICATIONS: 'REPLACE_NOTIFICATIONS',
	ADD_NOTIFICATION: 'ADD_NOTIFICATION',
	APPEND_NOTIFICATIONS: 'APPEND_NOTIFICATIONS'
};

const ROUTE_APP_NAME = {
	SETTINGS: 'Site Settings',
	AP_TAG:'App - Ap Tag',
	AMP: 'App - Amp',
	INNOVATIVE_ADS: 'App - Innovative Ads',
	HEADER_BIDDING_BIDDERS: 'HB App - Bidders',
	HEADER_BIDDING_INVENTORY: 'HB App - Inventory',
	HEADER_BIDDING_PREBID_SETTINGS: 'HB App - Prebid Settings',
	HEADER_BIDDING_OPTIMIZATION: 'HB App - Optimization',
	HEADER_BIDDING_AMAZON_UAM: 'HB App - Amazon UAM',
	OPS_PANEL_ACCOUNTS: 'Ops Panel - Accounts',
	OPS_PANEL_SETTINGS: 'Ops Panel - Settings',
	OPS_PANEL_TOOLS: 'Ops Panel - Tools'
};
export {
	GLOBAL_ACTIONS,
	USER_ACTIONS,
	NETWORK_CONFIG_ACTIONS,
	ADS_TXT_ACTIONS,
	SITE_ACTIONS,
	UI_ACTIONS,
	REPORTS_ACTIONS,
	URL_REPORTS_ACTIONS,
	NOTIFICATION_ACTIONS,
	ROUTE_APP_NAME
};
