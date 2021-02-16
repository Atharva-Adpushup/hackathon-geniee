const LINE_CHART_CONFIG = {
	chart: {
		type: 'spline'
	},
	title: {
		text: ''
	},
	xAxis: {
		categories: []
	},
	yAxis: {
		title: {
			text: 'CPM ($)'
		}
	},
	plotOptions: {
		line: {
			dataLabels: {
				enabled: true
			},
			enableMouseTracking: false
		}
	},
	series: []
};
const PIE_CHART_CONFIG = {
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
			allowPointSelect: false,
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
			name: 'Variables',
			colorByPoint: true,
			data: []
		}
	]
};

const imageCharts = {
	cpmLineChart: {
		name: {
			original: 'cpmLineChart',
			template: '@__cpm_twoWeeks_lineChart_url__@'
		}
	},
	adNetworkCPMLineChart: {
		name: {
			original: 'adNetworkCPMLineChart',
			template: '@__adNetwork_cpm_twoWeeks_lineChart_url__@'
		}
	},
	adNetworkRevenuePieChart: {
		name: {
			original: 'adNetworkRevenuePieChart',
			template: '@__adNetwork_revenue_thisWeek_pieChart_url__@'
		}
	},
	deviceRevenuePieChart: {
		name: {
			original: 'deviceRevenuePieChart',
			template: '@__device_revenue_thisWeek_pieChart_url__@'
		}
	},
	pageGroupRevenuePieChart: {
		name: {
			original: 'pageGroupRevenuePieChart',
			template: '@__pageGroup_revenue_thisWeek_pieChart_url__@'
		}
	}
};

module.exports = { LINE_CHART_CONFIG, PIE_CHART_CONFIG, imageCharts };
