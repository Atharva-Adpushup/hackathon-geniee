/* eslint-disable import/prefer-default-export */

function getTickRoundOff(min, max) {
	const diff = max - min;

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
		for (tick; tick - increment <= this.dataMax; tick += increment) {
			positions.push(tick);
		}
	}
	return positions;
}

const defaultChartConfig = {
	chart: {
		ignoreHiddenSeries: false,
		spacingTop: 35,
		style: {
			fontFamily: 'Karla'
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
	colors: ['#d9d332', '#d97f3e', '#50a4e2', '#2e3b7c', '#bf4b9b', '#4eba6e', '#eb575c', '#ca29f3']
};

export function getCustomChartConfig(title, type, config, yAxisGroups, activeLegendItems) {
	let chartConfig = {
		...defaultChartConfig,
		chart: { ...defaultChartConfig.chart, type },
		...config
	};

	if (title) {
		chartConfig.title = { text: title };
	}

	if (
		activeLegendItems &&
		activeLegendItems.length &&
		chartConfig.series &&
		chartConfig.series.length
	) {
		const { series } = chartConfig;

		let i;
		const len1 = series.length;
		for (i = 0; i < len1; i += 1) {
			const singleSeries = series[i];

			let j;
			const len2 = activeLegendItems.length;
			for (j = 0; j < len2; j += 1) {
				const activeLegendItem = activeLegendItems[j];
				singleSeries.visible = singleSeries.name === activeLegendItem;
				if (singleSeries.name === activeLegendItem) break;
			}
		}
	} else if (chartConfig.series && chartConfig.series.length) {
		const { series } = chartConfig;

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
				const yAxis = [];
				const seriesForChart = [];
				let colorIndex = 0;

				let i;
				const len1 = yAxisGroups.length;

				for (i = 0; i < len1; i += 1) {
					const yAxisGroup = yAxisGroups[i];
					const yAxisGroupNameArray = [];
					let yAxisGroupForChart = {};

					if (yAxisGroup.seriesNames && yAxisGroup.seriesNames.length) {
						let j;
						const len2 = yAxisGroup.seriesNames.length;

						for (j = 0; j < len2; j += 1) {
							const yAxisGroupSeriesName = yAxisGroup.seriesNames[j];
							const { series } = chartConfig;
							const index = series.findIndex(
								singleSeries => singleSeries.name === yAxisGroupSeriesName
							);

							if (index !== -1) {
								yAxisGroupNameArray.push(yAxisGroupSeriesName);

								const singleSeries = {
									lineWidth: 1.5,
									marker: {
										symbol: 'circle',
										radius: 3.2
									},
									_colorIndex: colorIndex,
									...series[index],
									yAxis: i
								};
								seriesForChart.push(singleSeries);

								colorIndex += 1;
							}
						}
					}

					if (yAxisGroupNameArray.length) {
						yAxisGroupForChart.title = { text: yAxisGroupNameArray.join(' / ') };
						yAxisGroupForChart.tickPositioner = tickPositioner;
						yAxisGroupForChart.index = i;
						yAxisGroupForChart.opposite = i > 0;

						if (yAxisGroup.yAxisConfig) {
							yAxisGroupForChart = {
								...yAxisGroupForChart,
								...yAxisGroup.yAxisConfig
							};
						}

						yAxis.push(yAxisGroupForChart);
					}
				}

				if (yAxis.length && seriesForChart.length) {
					chartConfig.yAxis = yAxis;
					chartConfig.series = seriesForChart;
				}

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
							enabled: false
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
