/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable import/no-named-as-default */
/* eslint-disable react/no-did-update-set-state */

import React from 'react';
import ReactHighcharts from 'react-highcharts';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import cloneDeep from 'lodash/cloneDeep';
import { numberWithCommas } from '../../helpers/utils';
import { Row } from '../../../../helpers/react-bootstrap-imports';
import ChartLegend from './ChartLegend';

class Chart extends React.Component {
	constructor(props) {
		super(props);
		this.minRangeValue = 0;
		this.maxRangeValue = 20;
		this.value = 1000;
		this.sliderMarks = this.generateMarksForSlider();
		const {
			chartData: { xAxis, yAxis }
		} = this.props;
		this.state = {
			xAxisData: xAxis,
			yAxisData: yAxis,
			excludedSites: [],
			startRange: 0,
			endRange: 10
		};
	}

	componentDidMount() {
		const { startRange, endRange } = this.state;
		const range = [startRange, endRange];
		this.setGraphAxesValues(range);
	}

	componentDidUpdate(prevProps, prevState) {
		const prevChartData = prevProps.chartData;
		const { chartData: newChartData } = this.props;
		const { startRange, endRange } = this.state;
		const range = [startRange, endRange];
		const { excludedSites } = this.state;
		if (prevChartData.xAxis.length !== newChartData.xAxis.length) {
			this.setState({
				xAxisData: newChartData.xAxis,
				yAxisData: newChartData.yAxis
			});
			this.setGraphAxesValues(range);
		}
		if (prevState.excludedSites.length !== excludedSites.length) {
			this.setGraphAxesValues(range);
		}
	}

	generateMarksForSlider = () => {
		const marks = {};
		for (let i = 0; i <= 20; i++) marks[i] = `$${i}`;
		return marks;
	};

	setGraphAxesValues = data => {
		const [start, end] = data;
		const { excludedSites } = this.state;
		const {
			chartData: { xAxis, yAxis }
		} = this.props;
		const yAxisChartData = cloneDeep(yAxis);
		const startIndex = xAxis.indexOf(start);
		const endIndex = xAxis.indexOf(end);
		yAxisChartData.forEach(site => {
			const isSiteExcluded = excludedSites.includes(site.name);
			site.data = isSiteExcluded ? [] : site.data.slice(startIndex, endIndex);
		});
		this.setState({
			xAxisData: xAxis.slice(startIndex, endIndex),
			yAxisData: yAxisChartData,
			startRange: start,
			endRange: end
		});
	};

	calculateBidData = (start, end) => {
		const bidWonData = [];
		const { excludedSites } = this.state;
		const {
			chartData: { xAxis, yAxis }
		} = this.props;
		const yAxisData = cloneDeep(yAxis);
		const startIndex = xAxis.indexOf(start);
		const endIndex = xAxis.indexOf(end);
		const xAxisChartData = xAxis.slice(startIndex, endIndex);

		yAxisData.forEach(site => {
			if (excludedSites.includes(site.name)) return;

			let totalEcpm = 0;
			site.data = site.data.slice(startIndex, endIndex);
			const totalBidsWon = site.data.reduce((acc, val) => acc + val, 0);
			xAxisChartData.forEach((eCpm, index) => {
				const bidsWonAteCpm = eCpm * site.data[index];
				totalEcpm += bidsWonAteCpm;
			});
			const avgEcpm = (totalEcpm / totalBidsWon).toFixed(2);
			bidWonData.push({ siteName: site.name, totalBidsWon, avgEcpm });
		});
		return {
			bidWonData,
			range: { start, end }
		};
	};

	toggleSite = name => {
		const {
			chartData: { yAxis }
		} = this.props;
		let { excludedSites } = this.state;

		const yAxisDataLength = yAxis.length;
		excludedSites = cloneDeep(excludedSites);

		if (excludedSites.length === yAxisDataLength - 1 && !excludedSites.includes(name)) return;
		if (excludedSites.includes(name))
			excludedSites = excludedSites.filter(siteName => siteName !== name);
		else excludedSites.push(name);

		this.setState({
			excludedSites
		});
	};

	generateBidData = (startIndex, endIndex) => {
		const bidData = [this.calculateBidData(startIndex, endIndex)];
		if (startIndex !== 0) bidData.push(this.calculateBidData(0, startIndex));
		if (endIndex !== 20) bidData.push(this.calculateBidData(endIndex, 20));

		return bidData.map((data, index) => {
			const { range } = data;
			return (
				<div className="bid-data-card" key={range.start}>
					<div className={index === 0 ? 'active-range' : ''}>
						{`$${range.start} - $${range.end}`}
					</div>
					{data.bidWonData.map(item => (
						<div className="bid-data">
							<div className="site-name">{`${item.siteName}`}</div>
							<div className="site-bid-details">
								<div>{` Bids won: ${item.totalBidsWon.toLocaleString()}`}</div>
								<div> Avg eCPM: ${item.avgEcpm}</div>
							</div>
						</div>
					))}
				</div>
			);
		});
	};

	render() {
		// const sliderMarks = this.generateMarksForSlider();
		const { excludedSites, startRange, endRange, xAxisData, yAxisData } = this.state;
		const rangeSliderStyles = {
			handle: [{ backgroundColor: '#eb575c' }, { backgroundColor: '#eb575c' }],
			dot: { bottom: '-4px', width: '12px', height: '12px' },
			rail: { backgroundColor: 'rgba(235, 87, 92, 0.3)' },
			activeDot: { backgroundColor: '#eb575c', border: '2px solid #38618C' }
		};
		const config = {
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			legend: {
				enabled: false
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
				categories: xAxisData,
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
			series: yAxisData
		};

		return (
			<>
				<Row>
					<div id="bidder-landscape-slider" className="">
						<Slider
							range
							allowCross={false}
							draggableTrack
							marks={this.sliderMarks}
							min={this.minRangeValue}
							dots={false}
							max={this.maxRangeValue}
							step={1}
							pushable={1}
							onAfterChange={this.setGraphAxesValues}
							defaultValue={[startRange, endRange]}
							handleStyle={rangeSliderStyles.handle}
							dotStyle={rangeSliderStyles.dot}
							railStyle={rangeSliderStyles.rail}
							activeDotStyle={rangeSliderStyles.activeDot}
						/>
					</div>
					<ReactHighcharts config={config} />
					<ChartLegend
						data={yAxisData}
						colors={config.colors}
						excludedSites={excludedSites}
						toggleSite={this.toggleSite}
					/>
				</Row>

				<div sm={2} className="bid-data-container">
					{this.generateBidData(startRange, endRange)}
				</div>
			</>
		);
	}
}

export default Chart;
/* eslint-enable */
