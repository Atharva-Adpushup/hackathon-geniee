/* eslint-disable import/prefer-default-export */

function getTickRoundOff(min, max) {
	const diff = max - min;
	if (diff < 1) return 0.1;
	if (diff < 5) return 0.5;
	if (diff < 10) return 1;
	if (diff < 50) return 2;
	if (diff < 100) return 5;
	if (diff < 1000) return 10;
	if (diff < 10000) return 100;
	return 1000;
}

function tickPositioner() {
	const tickRoundOff = getTickRoundOff(this.dataMin, this.dataMax);
	const positions = [];

	let tick = Math.floor(this.dataMin / tickRoundOff) * tickRoundOff;

	const increment = Math.ceil((this.dataMax - this.dataMin) / 6 / tickRoundOff) * tickRoundOff;

	if (this.dataMax !== null && this.dataMin !== null) {
		for (tick; tick <= this.dataMax + increment; tick += increment) {
			positions.push(parseFloat(tick.toFixed(2)));
		}
	}
	return positions;
}

const defaultChartConfig = {
	chart: {
		ignoreHiddenSeries: false,
		spacingTop: 35,
		style: {
			fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif'
		},
		events: {}
	},
	lang: {
		thousandsSep: ','
	},
	legend: {
		enabled: false
	},
	tooltip: {
		shared: true
	},
	credits: {
		enabled: false
	},
	plotOptions: {
		line: {
			animation: false
		}
	},
	responsive: {
		rules: [
			{
				condition: {
					maxWidth: 500
				}
			}
		]
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

function getGroupedYAxisAndSeries(chartType, yAxisGroups, existingSeries) {
	const yAxis = [];
	const seriesForChart = [];
	let colorIndex = 0;
	let opposite = false;
	let yAxisCount = 0;

	existingSeries.forEach((series, index) => {
		const singleSeries = {
			type: chartType === 'spline' ? 'spline' : 'line',
			lineWidth: 1.5,
			_colorIndex: colorIndex,
			...series,
			yAxis: index
		};
		const legend = {
			title: { text: series.name },
			index,
			visible: false,
			value: series.value
		};
		if (yAxisCount < 2 && series.visible) {
			legend.visible = true;
			legend.opposite = opposite;
			if (series.valueType == 'money')
				legend.labels = {
					format: '${value}'
				};
			yAxisCount += 1;
			opposite = !opposite;
		}
		yAxis.push(legend);
		singleSeries.tooltip = {
			useHTML: true,
			headerFormat: '<span style="font-size:14px;font-weight:bold">{point.key}</span><br/>',
			pointFormatter() {
				const point = this;
				const num = point.y.toFixed(2);
				return `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
					point.series.userOptions.valueType === 'money'
						? `$${numberWithCommas(num)}`
						: numberWithCommas(point.y)
				}</b><br/>`;
			}
		};
		seriesForChart.push(singleSeries);
		colorIndex += 1;
	});

	// for (i = 0; i < len1; i += 1) {
	// 	const yAxisGroup = yAxisGroups[i];
	// 	const yAxisGroupNameArray = [];
	// 	let yAxisGroupForChart = {};

	// 	if (yAxisGroup.seriesNames && yAxisGroup.seriesNames.length) {
	// 		let j;
	// 		const len2 = yAxisGroup.seriesNames.length;

	// 		for (j = 0; j < len2; j += 1) {
	// 			const yAxisGroupSeriesName = yAxisGroup.seriesNames[j];
	// 			const index = existingSeries.findIndex(
	// 				singleSeries => singleSeries.name === yAxisGroupSeriesName
	// 			);

	// 			if (index !== -1) {
	// 				yAxisGroupNameArray.push(yAxisGroupSeriesName);

	// 				const singleSeries = {
	// 					type: chartType === 'spline' ? 'spline' : 'line',
	// 					lineWidth: 1.5,
	// 					_colorIndex: colorIndex,
	// 					...existingSeries[index],
	// 					yAxis: i,
	// 					tooltip: {
	// 						useHTML: true,
	// 						headerFormat: '<span style="font-size:14px;font-weight:bold">{point.key}</span><br/>',
	// 						pointFormatter: () => {
	// 							const point = this;
	// 							const num = Math.round(point.y * 100) / 100;
	// 							return `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
	// 								point.series.userOptions.valueType === 'money' ? '$' : ''
	// 							}${numberWithCommas(num)}</b><br/>`;
	// 						}
	// 					}
	// 				};

	// 				seriesForChart.push(singleSeries);

	// 				colorIndex += 1;
	// 			}
	// 		}
	// 	}

	// 	if (yAxisGroupNameArray.length) {
	// 		yAxisGroupForChart.title = { text: yAxisGroupNameArray.join(' / ') };
	// 		// yAxisGroupForChart.tickPositioner = tickPositioner;
	// 		yAxisGroupForChart.index = i;
	// 		yAxisGroupForChart.opposite = i > 0;

	// 		if (yAxisGroup.yAxisConfig) {
	// 			yAxisGroupForChart = {
	// 				...yAxisGroupForChart,
	// 				...yAxisGroup.yAxisConfig
	// 			};
	// 		}

	// 		yAxis.push(yAxisGroupForChart);
	// 	}
	// }

	return { yAxis, seriesForChart };
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getCustomChartConfig(
	type,
	series,
	xAxis,
	customConfig,
	yAxisGroups,
	activeLegendItems
) {
	let chartConfig = {
		...defaultChartConfig,
		chart: { ...defaultChartConfig.chart, type },
		title: { text: undefined },
		series,
		xAxis,
		...customConfig
	};

	if (activeLegendItems && chartConfig.series && chartConfig.series.length) {
		if (Array.isArray(activeLegendItems)) {
			let i;
			const len1 = series.length;
			for (i = 0; i < len1; i += 1) {
				const singleSeries = series[i];

				let j;
				const len2 = activeLegendItems.length;
				for (j = 0; j < len2; j += 1) {
					const activeLegendItem = activeLegendItems[j];
					singleSeries.visible = singleSeries.value === activeLegendItem.value;
					if (singleSeries.value === activeLegendItem.value) break;
				}
			}
		} else {
			let i;
			const len1 = series.length;
			for (i = 0; i < len1; i += 1) {
				const singleSeries = series[i];
				singleSeries.visible = true;
				singleSeries.tooltip = {
					useHTML: true,
					headerFormat: '<span style="font-size:14px;font-weight:bold">{point.key}</span><br/>',
					pointFormatter() {
						const point = this;
						const num = point.y.toFixed(2);
						return `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
							point.series.userOptions.valueType === 'money'
								? `$${numberWithCommas(num)}`
								: numberWithCommas(point.y)
						}</b><br/>`;
					}
				};
			}
		}
	} else if (chartConfig.series && chartConfig.series.length) {
		let i;
		const len1 = series.length;
		for (i = 0; i < len1; i += 1) {
			const singleSeries = series[i];
			singleSeries.visible = true;
		}
	}

	switch (type) {
		case 'line': {
			chartConfig.plotOptions = {
				...chartConfig.plotOptions,
				line: { className: 'myLineClass' }
			};
			chartConfig.xAxis.className = 'myXAxisClass';

			// Set yAxis Groups for Line Chart
			if (yAxisGroups && yAxisGroups.length) {
				const { yAxis, seriesForChart } = getGroupedYAxisAndSeries(
					type,
					yAxisGroups,
					chartConfig.series
				);
				if (yAxis.length && seriesForChart.length) {
					chartConfig.yAxis = yAxis;
					chartConfig.series = seriesForChart;
				}

				break;
			} else if (
				!Array.isArray(activeLegendItems) &&
				chartConfig.series &&
				chartConfig.series.length
			) {
				chartConfig.yAxis = { title: activeLegendItems.name };
				break;
			}

			chartConfig.series = [];

			break;
		}
		case 'spline': {
			chartConfig.plotOptions = {
				...chartConfig.plotOptions,
				spline: { className: 'mySplineClass' }
			};
			chartConfig.xAxis.className = 'myXAxisClass';

			// Set yAxis Groups for Line Chart
			if (yAxisGroups && yAxisGroups.length) {
				const { yAxis, seriesForChart } = getGroupedYAxisAndSeries(
					type,
					yAxisGroups,
					chartConfig.series
				);
				if (yAxis.length && seriesForChart.length) {
					chartConfig.yAxis = yAxis;
					chartConfig.series = seriesForChart;
				}

				break;
			} else if (
				!Array.isArray(activeLegendItems) &&
				chartConfig.series &&
				chartConfig.series.length
			) {
				chartConfig.yAxis = { title: activeLegendItems.name };
				if (activeLegendItems.valueType === 'money')
					chartConfig.yAxis.labels = {
						format: '${value}'
					};
				break;
			}

			chartConfig.series = [];

			break;
		}
		case 'pie': {
			chartConfig = {
				...chartConfig,
				plotOptions: {
					...chartConfig.plotOptions,
					pie: {
						...chartConfig.plotOptions.pie,
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							format: '<b>{point.name}</b>: {point.percentage:.1f} %',
							style: {
								color: 'black'
							}
						},
						showInLegend: true
					}
				}
			};
			break;
		}
		default: {
			break;
		}
	}
	return chartConfig;
}
