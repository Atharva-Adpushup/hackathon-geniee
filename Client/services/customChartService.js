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

function roundOffTwoDecimal(value) {
	const roundedNum = Math.round(value * 100) / 100;
	return roundedNum.toFixed(2);
}

function tickPositioner() {
	const tickRoundOff = getTickRoundOff(this.dataMin, this.dataMax);
	const positions = [];

	let tick = Math.floor(this.dataMin / tickRoundOff) * tickRoundOff;

	const increment = Math.ceil((this.dataMax - this.dataMin) / 6 / tickRoundOff) * tickRoundOff;

	if (this.dataMax !== null && this.dataMin !== null) {
		for (tick; tick <= this.dataMax + increment; tick += increment) {
			positions.push(parseFloat(roundOffTwoDecimal(tick)));
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

function getGroupedYAxisAndSeries(chartType, existingSeries, yAxisGroups) {
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
			yAxis: yAxisGroups && yAxisGroups.length ? 0 : index
		};
		if (!yAxisGroups) {
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
		}
		singleSeries.tooltip = {
			useHTML: true,
			headerFormat: '<span style="font-size:14px;font-weight:bold">{point.key}</span><br/>',
			pointFormatter() {
				const point = this;
				const num = roundOffTwoDecimal(point.y);
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

	if (yAxisGroups && yAxisGroups.length) {
		yAxis.push({
			title: { text: yAxisGroups[0].seriesNames.join(' / ') },
			index: 0,
			visible: true,
			...yAxisGroups[0].yAxisConfig
		});
	}

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

	let validateActiveLegendItems;
	if (
		(Array.isArray(activeLegendItems) && activeLegendItems.length > 0) ||
		typeof activeLegendItems === 'object'
	) {
		validateActiveLegendItems = true;
	} else {
		validateActiveLegendItems = false;
	}
	if (type == 'line' || type == 'spline') {
		if (validateActiveLegendItems && chartConfig.series && chartConfig.series.length) {
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
							const num = roundOffTwoDecimal(point.y);
							return `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${
								point.series.userOptions.valueType === 'money'
									? `$${numberWithCommas(num)}`
									: numberWithCommas(point.y)
							}</b><br/>`;
						}
					};
				}
			}
		} else if (
			yAxisGroups &&
			yAxisGroups.length &&
			chartConfig.series &&
			chartConfig.series.length
		) {
			let i;
			const len1 = series.length;
			for (i = 0; i < len1; i += 1) {
				const singleSeries = series[i];
				singleSeries.visible = true;
			}
		} else {
			let i;
			const len1 = series.length;
			for (i = 0; i < len1; i += 1) {
				const singleSeries = series[i];
				singleSeries.visible = false;
			}
		}
	} else if (type == 'pie') {
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
					const isMoneyValueType = !!(point.series.valueType === 'money');
					const computedValuePrefix = isMoneyValueType ? '$' : '';
					return `<span style="color:${point.color}">\u25CF</span> ${
						point.series.name
					}: <b>${computedValuePrefix}${point.y}</b><br/>`;
				}
			};
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
			if (Array.isArray(activeLegendItems) || (yAxisGroups && yAxisGroups.length)) {
				const { yAxis, seriesForChart } = getGroupedYAxisAndSeries(
					type,
					chartConfig.series,
					yAxisGroups
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
			if (Array.isArray(activeLegendItems) || (yAxisGroups && yAxisGroups.length)) {
				const { yAxis, seriesForChart } = getGroupedYAxisAndSeries(
					type,
					chartConfig.series,
					yAxisGroups
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
