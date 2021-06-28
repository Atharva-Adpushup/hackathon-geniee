const LINE_CHART_CONFIG = {
	exporting: { enabled: false },
	credits: {
		enabled: false
	},
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
			text: ''
		},
		labels: {
			// eslint-disable-next-line no-template-curly-in-string

			formatter: function() {
				return (
					"<div style='font-family: Arial;color:#2A2733!important;font-weight: 600;'>" +
					'$ ' +
					this.value +
					'</div>'
				);
			}
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

// const colorLabelMapping = {
// 	'#e84245': '#683636',
// 	'#fbd2ce': '#fef0f0',
// 	'#ff6063': '#e88386',
// 	'#ee6161': '#874c4e',
// 	'#f07672': '#e84245',
// 	'#874c4e': '#fbd2ce',
// 	'#e88386': '#ff6063',
// 	'#fef0f0': '#ee6161',
// 	'#683636': '#f07672'
// };

const PIE_CHART_CONFIG = {
	exporting: { enabled: false },
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
	series: [
		{
			type: 'pie',
			dataLabels: {
				useHTML: true,
				connectorColor: '#fef0f0',
				softConnector: false,
				connectorWidth: 3,
				connectorShape: 'crookedLine',
				crookDistance: '90%',
				alignTo: 'plotEdges',
				formatter: function() {
					var labelName;
					if (this.point.percent > 5) labelName = this.point.name;
					else labelName = '(' + this.point.percent + '%)' + this.point.name;
					if (labelName.length > 20) labelName = labelName.slice(0, 17) + '...';
					return (
						"<span style='font-family: Arial;color: #2A2733!important;font-weight: 600;' >" +
						labelName +
						'</span>'
					);
				},
				distance: 50,
				enabled: true,
				style: {
					fontWeight: '600',
					fontSize: '12px',
					textOutline: 'none'
				}
			},
			colors: [
				'#E83245',
				'#EB4B52',
				'#EE6161',
				'#F07672',
				'#F38B85',
				'#F6A19B',
				'#F9B9B3',
				'#fef0f0',
				'#f8f8f8'
			]
		},
		{
			type: 'pie',
			dataLabels: {
				useHTML: true,
				distance: -30,
				enabled: true,
				style: {
					fontWeight: '600',
					fontSize: '12px',
					textOutline: 'none'
				},
				formatter: function() {
					var labelChangedColor = {
						'#E83245': '#FFFFFF',
						'#EB4B52': '#FFFFFF'
					};
					var defaultColor = '#2A2733';
					if (labelChangedColor[this.point.color])
						defaultColor = labelChangedColor[this.point.color];
					if (this.point.percent > 5)
						return (
							"<span style='font-family: Arial;color:" +
							defaultColor +
							";font-weight: 600;' >" +
							this.point.percent +
							' %' +
							'</span>'
						);
					else return '';
				}
			},
			colors: [
				'#E83245',
				'#EB4B52',
				'#EE6161',
				'#F07672',
				'#F38B85',
				'#F6A19B',
				'#F9B9B3',
				'#fef0f0',
				'#f8f8f8'
			]
		}
	],
	plotOptions: {
		pie: {
			size: '80%',
			data: []
		}
	}
};

module.exports = {
	LINE_CHART_CONFIG,
	PIE_CHART_CONFIG
};
