const siteMappingActions = {
		FETCH_SITES: 'FETCH_SITES',
		SET_SITES_DATA: 'SET_SITES_DATA'
	},
	liveSitesMappingActions = {
		FETCH_LIVE_SITES: 'FETCH_LIVE_SITES',
		SET_LIVE_SITES_DATA: 'SET_LIVE_SITES_DATA'
	},
	globalMetricChartsActions = {
		FETCH_NETWORK_WISE_DATA: 'FETCH_NETWORK_WISE_DATA',
		SET_NETWORK_WISE_DATA: 'SET_NETWORK_WISE_DATA',
		FETCH_METRICS_DATA: 'FETCH_METRICS_DATA',
		SET_METRICS_DATA: 'SET_METRICS_DATA',
		FETCH_MODE_WISE_TRAFFIC_DATA: 'FETCH_MODE_WISE_TRAFFIC_DATA',
		SET_MODE_WISE_TRAFFIC_DATA: 'SET_MODE_WISE_TRAFFIC_DATA'
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
	};

export {
	siteMappingActions,
	liveSitesMappingActions,
	globalMetricChartsActions,
	siteMapping,
	liveSites,
	LINE_CHART_CONFIG,
	PIE_CHART_CONFIG
};
