import React from 'react';
import Highcharts from 'highcharts';
import { getWidgetValidDationState } from '../helpers/utils';
import Empty from '../../../Components/Empty/index';

var colors = Highcharts.getOptions().colors;

function computeGraphData(displayData) {
	const {
		data: { result = [] },
		modeData
	} = displayData;

	const categories = modeData.map(mode => mode.value);
	const seriesData = [];
	const totalAdpushupCount = result.map(val => val.adpushup_count).reduce((a, b) => a + b, 0);

	for (let i = 0; i < categories.length; i++) {
		seriesData.push({
			y: parseFloat(
				(
					(result
						.filter(obj => {
							return obj.mode === categories[i];
						})
						.map(val => val.adpushup_count)
						.reduce((a, b) => a + b, 0) /
						totalAdpushupCount) *
					100
				).toFixed(2)
			),
			colors: colors[i],
			drilldown: {
				name: categories[i],
				categories: result
					.filter(obj => {
						return obj.mode === categories[i];
					})
					.map(val => val.error_code),
				data: [
					...new Set(
						result
							.filter(obj => {
								return obj.mode === categories[i];
							})
							.map(val => parseFloat(((val.adpushup_count / totalAdpushupCount) * 100).toFixed(2)))
					)
				]
			}
		});
	}

	return { categories, seriesData };
}

class ModeReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: {}
		};
	}

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const seriesData = computeGraphData(displayData);
		return { series: seriesData };
	}

	highChartsRender() {
		const {
			series: { categories, seriesData }
		} = this.state;

		var browserData = [],
			versionsData = [],
			drillDataLen,
			brightness,
			dataLen = seriesData.length;

		// Build the data arrays
		for (var i = 0; i < dataLen; i += 1) {
			// add browser data
			browserData.push({
				name: categories[i],
				y: seriesData[i].y,
				color: seriesData[i].colors
			});

			// add version data
			drillDataLen = seriesData[i].drilldown.data.length;
			for (var j = 0; j < drillDataLen; j += 1) {
				brightness = 0.2 - j / drillDataLen / 5;
				versionsData.push({
					name: seriesData[i].drilldown.categories[j],
					y: seriesData[i].drilldown.data[j],
					color: Highcharts.Color(seriesData[i].colors)
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
			credits: {
				enabled: false
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
			tooltip: {
				valueSuffix: '%'
			},
			series: [
				{
					name: 'Mode',
					data: browserData,
					size: '60%',
					dataLabels: {
						formatter: function() {
							return this.y >= 0 ? this.point.name : null;
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
							// display only if larger than or equal to 0
							return this.y >= 0 ? '<b>' + this.point.name + ':</b> ' + this.y + '%' : null;
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
