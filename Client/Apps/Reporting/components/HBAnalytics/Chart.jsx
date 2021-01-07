/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';

import sortBy from 'lodash/sortBy';
// import CustomChart from '../../../../Components/CustomChart';

import { roundOffTwoDecimal, numberWithCommas } from '../../helpers/utils';
import { ANOMALY_THRESHOLD_CONSTANT } from '../../configs/commonConsts';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		const xAxis = this.enumerateDaysBetweenDates();

		this.state = {
			xAxis
		};
	}

	enumerateDaysBetweenDates = () => {
		const xAxis = { categories: [] };
		const { startDate, endDate, selectedInterval } = this.props;
		const dates = [];

		const currDate = moment(startDate).startOf('day');
		const lastDate = moment(endDate).startOf('day');

		switch (selectedInterval) {
			default:
			case 'daily':
				while (currDate.diff(lastDate) <= 0) {
					dates.push(currDate.clone().format('ll'));
					currDate.add(1, 'days');
				}
				break;
			case 'monthly':
				while (lastDate > currDate || currDate.format('M') === lastDate.format('M')) {
					dates.push(currDate.format('MMM, YYYY'));
					currDate.add(1, 'month');
				}
				break;
			case 'cumulative':
				dates.push(`${currDate.format('ll')} to ${lastDate.format('ll')}`);
				break;
		}

		xAxis.categories = dates;
		return xAxis;
	};

	render() {
		const { chartData, chartDetails, isHB } = this.props;
		const { xAxis } = this.state;
		const { eCPM, RESPONSE_TIME, PERCENT } = ANOMALY_THRESHOLD_CONSTANT;

		let config = {
			title: {
				text: chartDetails.name
			},
			subtitle: {
				text: chartDetails.caption
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
			]
		};
		if (isHB && chartData) {
			if (chartDetails.type === 'line') {
				// eslint-disable-next-line no-shadow
				let series = [];
				for (const each in chartData) {
					const value = chartData[each].map(network => network.value);
					series.push({
						name: each,
						type: 'spline',
						data: value,
						valueType: chartDetails.valueType,
						tooltip: {
							useHTML: true,
							headerFormat: '<span style="font-size:14px;font-weight:bold">{point.key}</span><br/>',
							pointFormatter() {
								const point = this;
								const num = roundOffTwoDecimal(point.y);
								return `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
									point.series.userOptions.valueType === 'money'
										? `$${numberWithCommas(num)}`
										: point.series.userOptions.valueType == 'percent'
										? `${numberWithCommas(point.y)}%`
										: point.series.userOptions.valueType == 'milliseconds'
										? `${numberWithCommas(point.y)} (ms)`
										: numberWithCommas(point.y)
								}</b><br/>`;
							}
						}
					});
				}

				series = sortBy(series, 'name');
				config = Object.assign({}, config, {
					xAxis,
					yAxis: {
						title: {
							text: chartDetails.name
						},
						labels: {
							format: `
									${
										chartDetails.valueType === 'money'
											? '${value}'
											: chartDetails.valueType === 'percent'
											? '{value}%'
											: chartDetails.valueType == 'milliseconds'
											? '{value}ms'
											: ''
									}
								`
						}
					},
					chart: {
						ignoreHiddenSeries: false,
						spacingTop: 35,
						style: { fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif' },
						type: 'spline'
					},
					series,
					legend: { enabled: false },
					plotOptions: {
						line: { animation: false },
						spline: { className: 'mySplineClass' }
					},
					lang: { thousandsSep: ',' },
					tooltip: {
						shared: true,
						formatter() {
							function comparator(a, b) {
								return b.y - a.y;
							}
							const points = this.points;
							let txt = '';
							points.sort(comparator);
							points.map(point => {
								const num = roundOffTwoDecimal(point.y);
								txt += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
									point.series.userOptions.valueType === 'money'
										? point.y >= ANOMALY_THRESHOLD_CONSTANT.eCPM ? `>= $${ANOMALY_THRESHOLD_CONSTANT.eCPM}` : `$${numberWithCommas(num)}`
										: point.series.userOptions.valueType == 'percent'
										? `${numberWithCommas(point.y)}%`
										: point.series.userOptions.valueType == 'milliseconds'
										? point.y >= ANOMALY_THRESHOLD_CONSTANT.RESPONSE_TIME ? `>= ${ANOMALY_THRESHOLD_CONSTANT.RESPONSE_TIME}` : `${numberWithCommas(point.y)} (ms)`
										: numberWithCommas(point.y)
								}</b><br/>`;

								return txt;
							});

							return txt;
						}
					}
				});
				return <ReactHighcharts config={config} />;
			}
			config = Object.assign({}, config, {
				chart: {
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false,
					type: 'pie'
				},
				tooltip: {
					pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
				},
				accessibility: {
					point: {
						valueSuffix: '%'
					}
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							format: '<b>{point.name}</b>: {point.percentage:.1f} %'
						}
					}
				},
				series: [
					{
						name: chartDetails.name,
						colorByPoint: true,
						data: chartDetails.data
					}
				]
			});

			return chartDetails.data.length ? (
				<ReactHighcharts config={config} />
			) : (
				<div className="noDataRow">
					<span>No Data to display Chart</span>
				</div>
			);
		}
		return '';
	}
}

export default Chart;
