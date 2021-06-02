export default {
	API_ROOT: '/api',
	ANALYTICS_API_CUSTOM_DATA: '/reports/getCustomStats',
	ANALYTICS_API_AP_STATS_BY_CUSTOM_DATA: '/reports/getAPStatsByCustom',
	ANALYTICS_API_WIDGET_DATA: '/reports/getWidgetData',
	ANALYTICS_API_UPDATE_STATUS: '/reports/getLastUpdateStatus',
	ANALYTICS_METAINFO_URL: '/common/metaInfo',
	HB_ANALYTICS_API_CUSTOM_DATA: '/hbanalytics/getCustomStats',
	HB_ANALYTICS_API_WIDGET_DATA: '/hbanalytics/getWidgetData',
	HB_ANALYTICS_API_UPDATE_STATUS: '/hbanalytics/getLastUpdateStatus',
	HB_ANALYTICS_API_CUSTOM_GRAPH_DATA: 'hbanalytics/getCustomGraphData',
	HB_ANALYTICS_API_BID_CPM_STATS: 'hbanalytics/getBidCPMStats',
	HB_MSGS: {
		UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
	},
	URL_ANALYTICS_API_CUSTOM_DATA: '/url/getCustomStats',
	AP_GETTING_STARTED_URL: 'https://campaign.adpushup.com/get-started/',
	NOTIFICATION_SERVICE: {
		HOST: 'https://notifications.adpushup.com'
	},
	ADPUSHUP_NETWORK_ID: 103512698,
	PREBID_SERVER_HOST: 'https://amp.adpushup.com/',
	MIXPANEL: {
		TOKEN: '96e958dc847c19d28cf873a827efae75'
	},
	disableDailyWeeklySnapshots: true,
	updateInventoryAdunit: "/ops/updateAdUnitData/",
	ADMIN_INVENTORY_LIST_TABLE_HEADER: [
		{
			Header: 'Site Id',
			accessor: 'siteId',
			width: 100,
			maxWidth: 100,
			minWidth: 100
		},
		{
			Header: 'Domain',
			accessor: 'siteDomain',
			width: 220,
			maxWidth: 250,
			minWidth: 250
		},
		{
			Header: 'Ad Unit Name',
			accessor: 'dfpAdunit',
			width: 500,
			maxWidth: 800,
			minWidth: 500
		},
		{
			Header: 'Settings',
			accessor: 'adUnitSettings',
			width: 200,
			maxWidth: 200,
			minWidth: 200
		}
	],
	ADMIN_INVENTORY_LIST_FILTER_LIST: [
		{ name: 'Domains', value: 'siteDomain', isDisabled: false, key: 'siteDomain' },
		{ name: 'Site Id', value: 'siteId', isDisabled: false, key: 'siteId' },
		{ name: 'Adunit Name', value: 'dfpAdunit', isDisabled: true, key: 'dfpAdunit' }
	]
};
