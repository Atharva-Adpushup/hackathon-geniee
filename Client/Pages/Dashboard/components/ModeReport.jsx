import React from 'react';
import Highcharts from 'highcharts';

var colors = Highcharts.getOptions().colors;
class ModeReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: {
				categories: ['Unknown', 'AdPushup', 'Fallback'],
				data: [
					{
						y: 400,
						color: colors[0],
						drilldown: {
							name: 'Unknown',
							categories: ['Unknown', 'No Error', 'PageGroup Not Found', 'FallBack Planned'],
							data: [100, 120, 120, 60]
						}
					},
					{
						y: 200,
						color: colors[1],
						drilldown: {
							name: 'AdPushup',
							categories: ['Unknown', 'No Error', 'PageGroup Not Found', 'FallBack Planned'],
							data: [50, 50, 50, 50]
						}
					},
					{
						y: 100,
						color: colors[6],
						drilldown: {
							name: 'Fallback',
							categories: ['Unknown', 'No Error'],
							data: [60, 40]
						}
					}
				]
			}
		};
	}

	highChartsRender() {
		const {
			series: { categories, data }
		} = this.state;

		var browserData = [];
		var versionsData = [];
		var i;
		var j;
		var dataLen = data.length;
		var drillDataLen;
		var brightness;

		// Build the data arrays
		for (i = 0; i < dataLen; i += 1) {
			// add browser data
			browserData.push({
				name: categories[i],
				y: data[i].y,
				color: data[i].color
			});

			// add version data
			drillDataLen = data[i].drilldown.data.length;
			for (j = 0; j < drillDataLen; j += 1) {
				brightness = 0.2 - j / drillDataLen / 5;
				versionsData.push({
					name: data[i].drilldown.categories[j],
					y: data[i].drilldown.data[j],
					color: Highcharts.Color(data[i].color)
						.brighten(brightness)
						.get()
				});
			}
		}

		Highcharts.chart({
			chart: {
				type: 'pie',
				renderTo: 'atmospheric-composition'
			},
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			plotOptions: {
				pie: {
					shadow: false,
					center: ['50%', '50%']
				}
			},
			series: [
				{
					name: 'Mode',
					data: browserData,
					size: '60%',
					dataLabels: {
						formatter: function() {
							return this.y > 5 ? this.point.name : null;
						},
						color: '#ffffff',
						distance: -30
					}
				},
				{
					name: 'Error Code',
					data: versionsData,
					size: '80%',
					innerSize: '60%',
					dataLabels: {
						formatter: function() {
							// display only if larger than 1
							return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y : null;
						}
					},
					id: 'versions'
				}
			],
			responsive: {
				rules: [
					{
						condition: {
							maxWidth: 400
						},
						chartOptions: {
							series: [
								{},
								{
									id: 'versions',
									dataLabels: {
										enabled: false
									}
								}
							]
						}
					}
				]
			}
		});
	}

	componentDidMount() {
		this.highChartsRender();
	}

	render() {
		return <div id="atmospheric-composition" />;
	}
}

export default ModeReport;
