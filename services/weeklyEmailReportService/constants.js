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
const PIE_CHART_CONFIG = {};

module.exports = { LINE_CHART_CONFIG, PIE_CHART_CONFIG };
