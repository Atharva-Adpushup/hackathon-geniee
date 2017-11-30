const LINE_CHART_CONFIG = {
	chart: {
		type: 'line'
	},
	title: {
		text: 'Performance Chart'
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
		text: 'Revenue Contribution chart'
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
module.exports = { LINE_CHART_CONFIG, PIE_CHART_CONFIG };
