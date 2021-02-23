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
			text: 'AdPushup Page RPM, Original Page RPM'
		},
		labels: {
			// eslint-disable-next-line no-template-curly-in-string
			format: '${value}'
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

module.exports = {
	LINE_CHART_CONFIG,
	PIE_CHART_CONFIG
};
