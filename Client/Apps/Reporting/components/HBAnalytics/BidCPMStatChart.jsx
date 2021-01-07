/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import ReactHighcharts from 'react-highcharts';
import { numberWithCommas } from '../../helpers/utils';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { chartData } = this.props;

		const config = {
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			credits: {
				enabled: false
			},
			colors: [
				'#d97f3e',
				'#2e3b7c',
				'#50a4e2',
				'#bf4b9b',
				'#d9d332',
				'#4eba6e',
				'#eb575c',
				'#ca29f3',
				'#cbe958',
				'#9b6f76',
				'#6b9c8a',
				'#5fa721',
				'#c78cf2',
				'#866004',
				'#6a05bb',
				'#5c760b',
				'#b2a01e',
				'#3a609f',
				'#265043',
				'#8fa5f0'
			],
			chart: {
				type: 'column',
				zoomType: 'xy',
				panning: true,
				panKey: 'shift'
			},
			xAxis: {
				categories: chartData.xAxis,
				crosshair: true,
				title: {
					text: 'eCPM'
				}
			},
			yAxis: {
				min: 0,
				title: {
					text: 'Bids Won'
				}
			},
			zoomType: 'x',
			tooltip: {
				useHTML: true,
				headerFormat: '<span style="font-size:14px;font-weight:bold">Total Bids Won</span><br/>',
				pointFormatter() {
					const point = this;
					return `<span style="color:${point.color}">\u25CF</span> ${
						point.series.name
					} <b>${numberWithCommas(point.y)}</b><br/>`;
				}
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}
			},
			series: chartData.yAxis
		};

		return <ReactHighcharts config={config} />;
	}
}

export default Chart;
