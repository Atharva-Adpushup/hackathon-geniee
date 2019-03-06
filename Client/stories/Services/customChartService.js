export function getCustomChartConfig(title, type, config) {
	let chartConfig = {
		chart: { type },
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle'
		},
		responsive: {
			rules: [
				{
					condition: {
						maxWidth: 500
					},
					chartOptions: {
						legend: {
							layout: 'horizontal',
							align: 'center',
							verticalAlign: 'top'
						}
					}
				}
			]
		},
		...config
	};

	if (title) {
		chartConfig.title = { text: title };
	}

	switch (type) {
		case 'line': {
			chartConfig.plotOptions = {
				...chartConfig.plotOptions,
				line: { className: 'myLineClass' }
			};
			chartConfig.xAxis.className = 'myXAxisClass';
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
