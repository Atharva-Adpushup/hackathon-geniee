const siteMappingActions = {
		FETCH_SITES: 'FETCH_SITES',
		SET_SITES_DATA: 'SET_SITES_DATA'
	},
	liveSitesMappingActions = {
		FETCH_LIVE_SITES: 'FETCH_LIVE_SITES',
		SET_LIVE_SITES_DATA: 'SET_LIVE_SITES_DATA'
	},
	DEFAULT_HB_CONFIG = {
		'300x250': [],
		'250x250': [],
		'200x200': [],
		'336x280': [],
		'728x90': [],
		'468x60': [],
		'300x600': [],
		'160x600': [],
		'120x600': [],
		'320x50': [],
		'320x100': [],
		'900x90': [],
		'970x250': [],
		'300x1050': [],
		responsivexresponsive: []
	},
	globalMetricChartsActions = {
		FETCH_NETWORK_WISE_DATA: 'FETCH_NETWORK_WISE_DATA',
		SET_NETWORK_WISE_DATA: 'SET_NETWORK_WISE_DATA',
		FETCH_METRICS_DATA: 'FETCH_METRICS_DATA',
		SET_METRICS_DATA: 'SET_METRICS_DATA',
		FETCH_MODE_WISE_TRAFFIC_DATA: 'FETCH_MODE_WISE_TRAFFIC_DATA',
		SET_MODE_WISE_TRAFFIC_DATA: 'SET_MODE_WISE_TRAFFIC_DATA',
		FETCH_TOP_10_COUNTRIES_DATA: 'FETCH_TOP_10_COUNTRIES_DATA',
		SET_TOP_10_COUNTRIES_DATA: 'SET_TOP_10_COUNTRIES_DATA',
		FETCH_TOP_10_SITES_DATA: 'FETCH_TOP_10_SITES_DATA',
		SET_TOP_10_SITES_DATA: 'SET_TOP_10_SITES_DATA',
		FETCH_LOST_AND_FOUND_LIVE_SITES_DATA: 'FETCH_LOST_AND_FOUND_LIVE_SITES_DATA',
		SET_LOST_AND_FOUND_LIVE_SITES_DATA: 'SET_LOST_AND_FOUND_LIVE_SITES_DATA'
	},
	siteMapping = {
		labels: {
			siteId: 'Site Id',
			siteDomain: 'Site Domain',
			ownerEmail: 'Owner Email',
			channels: 'Channels',
			mode: 'Mode',
			step: 'Status',
			customSizes: 'Custom Sizes',
			dateCreated: 'Date Created',
			pubId: 'Publisher Id',
			adsenseEmail: 'Adsense Email'
		},
		headers: [
			{
				title: 'Site Id',
				prop: 'Site Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Site Domain',
				prop: 'Site Domain',
				sortable: true,
				filterable: true
			},
			{
				title: 'Owner Email',
				prop: 'Owner Email',
				sortable: true,
				filterable: true
			},
			{
				title: 'Mode',
				prop: 'Mode',
				filterable: true
			},
			{
				title: 'Date Created',
				prop: 'Date Created',
				sortable: true,
				filterable: true
			},
			{
				title: 'Channels',
				prop: 'Channels',
				sortable: true,
				filterable: true
			},
			{
				title: 'Status',
				prop: 'Status',
				sortable: true,
				filterable: true
			},
			{
				title: 'Publisher Id',
				prop: 'Publisher Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Adsense Email',
				prop: 'Adsense Email',
				sortable: true,
				filterable: true
			}
			// {
			// 	title: 'Custom Sizes',
			// 	prop: 'Custom Sizes',
			// 	sortable: true,
			// 	filterable: true
			// }
		],
		modes: [
			{
				name: 'Both',
				value: 0
			},
			{
				name: 'Live',
				value: 1
			},
			{
				name: 'Draft',
				value: 2
			}
		],
		statuses: [
			{
				name: 'All',
				value: 0
			},
			{
				name: 'Pre-onboarding',
				value: 1
			},
			{
				name: 'Onboarding',
				value: 2
			},
			{
				name: 'Onboarded',
				value: 3
			}
		]
	},
	liveSites = {
		labels: {
			siteId: 'Site Id',
			name: 'Site Domain',
			pageviews: 'Pageviews',
			adpushup_impressions: 'AdPushup Impressions',
			total_impressions: 'Total Impressions',
			total_gross_revenue: 'Total Gross Revenue',
			total_revenue: 'Total Revenue'
		},
		headers: [
			{
				title: 'Site Id',
				prop: 'Site Id',
				sortable: true,
				filterable: true
			},
			{
				title: 'Site Domain',
				prop: 'Site Domain',
				sortable: true,
				filterable: true
			},
			{
				title: 'Pageviews',
				prop: 'Pageviews',
				sortable: true,
				filterable: true
			},
			{
				title: 'AdPushup Impressions',
				prop: 'AdPushup Impressions',
				filterable: true
			},
			{
				title: 'Total Impressions',
				prop: 'Total Impressions',
				sortable: true,
				filterable: true
			},
			{
				title: 'Total Gross Revenue',
				prop: 'Total Gross Revenue',
				sortable: true,
				filterable: true
			},
			{
				title: 'Total Revenue',
				prop: 'Total Revenue',
				sortable: true,
				filterable: true
			}
		]
	},
	LINE_CHART_CONFIG = {
		colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e', '#eb575c', '#ca29f3'],
		credits: {
			enabled: false
		},
		chart: {
			type: 'line'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			title: {
				text: ''
			}
		},
		plotOptions: {
			line: {
				dataLabels: {
					enabled: true
				},
				enableMouseTracking: true
			}
		},
		series: []
	},
	PIE_CHART_CONFIG = {
		colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e', '#eb575c', '#ca29f3'],
		credits: {
			enabled: false
		},
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: ''
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: '#555555'
					}
				}
			}
		},
		series: [
			{
				name: 'Metrics',
				colorByPoint: true,
				data: []
			}
		]
	},
	sizeConfigOptions = [
		{
			value: '300 250',
			label: '300x250'
		},
		{
			value: '250 250',
			label: '250x250'
		},
		{
			value: '200 200',
			label: '200x200'
		},
		{
			value: '336 280',
			label: '336x280'
		},
		{
			value: '728 90',
			label: '728x90'
		},
		{
			value: '468 60',
			label: '468x60'
		},
		{
			value: '300 600',
			label: '300x600'
		},
		{
			value: '160 600',
			label: '160x600'
		},
		{
			value: '120 600',
			label: '120x600'
		},
		{
			value: '320 50',
			label: '320x50'
		},
		{
			value: '320 100',
			label: '320x100'
		},
		{
			value: '900 90',
			label: '900x90'
		},
		{
			value: '970 250',
			label: '970x250'
		},
		{
			value: '300 1050',
			label: '300x1050'
		},
		{
			value: 'responsive responsive',
			label: 'responsivexresponsive'
		}
	],
	partnersList = [
		{
			value: 'districtm',
			label: 'districtm'
		},
		{
			value: 'oftmedia',
			label: 'oftmedia'
		},
		{
			value: 'pulsepoint',
			label: 'pulsepoint'
		},
		{
			value: 'c1x',
			label: 'c1x'
		},
		{
			value: 'medianet',
			label: 'medianet'
		},
		{
			value: 'districtmDMX',
			label: 'districtmDMX'
		},
		{
			value: 'openx',
			label: 'openx'
		},
		{
			value: 'conversant',
			label: 'conversant'
		},
		{
			value: '33across',
			label: '33across'
		}
	],
	devicesList = [
		'(min-width: 1200px)',
		'(min-width: 768px) and (max-width: 1199px)',
		'(min-width: 0px) and (max-width: 767px)'
	],
	biddersParams = {
		districtm: [
			{
				name: 'placementId',
				type: 'string'
			}
		],
		oftmedia: [
			{
				name: 'placementId',
				type: 'string'
			}
		],
		pulsepoint: [
			{
				name: 'cf',
				type: 'string'
			},
			{
				name: 'cp',
				type: 'integer'
			},
			{
				name: 'ct',
				type: 'integer'
			}
		],
		c1x: [
			{
				name: 'siteId',
				type: 'string'
			}
		],
		medianet: [
			{
				name: 'cid',
				type: 'string'
			}
		],
		districtmDMX: [
			{
				name: 'dmxid',
				type: 'integer'
			},
			{
				name: 'memberid',
				type: 'integer'
			}
		],
		openx: [
			{
				name: 'delDomain',
				type: 'string'
			},
			{
				name: 'unit',
				type: 'string'
			}
		],
		conversant: [
			{
				name: 'site_id',
				type: 'string'
			},
			{
				name: 'secure',
				type: 'integer'
			}
		],
		'33across': [
			{
				name: 'siteId',
				type: 'string'
			},
			{
				name: 'productId',
				type: 'string'
			}
		]
	};

export {
	siteMappingActions,
	liveSitesMappingActions,
	globalMetricChartsActions,
	siteMapping,
	liveSites,
	devicesList,
	partnersList,
	biddersParams,
	sizeConfigOptions,
	LINE_CHART_CONFIG,
	PIE_CHART_CONFIG,
	DEFAULT_HB_CONFIG
};
