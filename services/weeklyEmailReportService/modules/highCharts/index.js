const Promise = require('bluebird'),
	_ = require('lodash'),
	extend = require('extend'),
	moment = require('moment'),
	{ LINE_CHART_CONFIG, PIE_CHART_CONFIG } = require('../../constants'),
	Highcharts = require('highcharts-server').default,
	server = new Highcharts(3003);

function addHighChartsObject(inputData) {
	const defaultChartObject = {
			base64: '',
			imagePath: ''
		},
		resultData = extend(true, {}, inputData);

	resultData.report.charts = {
		adNetworkCPMLine: extend({}, defaultChartObject),
		adNetworkRevenuePie: extend({}, defaultChartObject),
		cpmLine: extend({}, defaultChartObject),
		deviceRevenuePie: extend({}, defaultChartObject),
		pageGroupRevenuePie: extend({}, defaultChartObject)
	};

	return resultData;
}

function getChartImageOptions() {
	return {
		width: 487,
		scale: 2
	};
}

function generateBase64(imgOptions, chartOptions) {
	return new Promise((resolve, reject) => {
		server.render(imgOptions, chartOptions, function(base64Data) {
			if (!base64Data) {
				return reject('generateBase64: Unable to generate high chart base64');
			}

			const imageUrl = `data:image/png;base64,${base64Data}`;
			return resolve(imageUrl);
		});
	});
}

function generateCPMLineBase64(inputData) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		imageOptions = getChartImageOptions(),
		series = [],
		lastWeekSeries = {
			name: 'Last Week',
			data: []
		},
		thisWeekSeries = {
			name: 'This Week',
			data: []
		},
		categories = [],
		contributionData = extend(true, {}, inputData.report.metricComparison.cpm.contribution);

	_.forOwn(contributionData.lastWeek, (cpmValue, dateKey) => {
		const dayCategory = moment(dateKey).format('ddd');

		categories.push(dayCategory);
		lastWeekSeries.data.push(cpmValue);
	});

	_.forOwn(contributionData.thisWeek, (cpmValue, dateKey) => {
		thisWeekSeries.data.push(cpmValue);
	});

	chartConfig.series.push(lastWeekSeries);
	chartConfig.series.push(thisWeekSeries);
	chartConfig.xAxis.categories.concat(categories);

	return generateBase64(imageOptions, chartConfig);
}

module.exports = {
	generateImageBase64: inputData => {
		const reportData = addHighChartsObject(inputData),
			getCPMLineBase64 = generateCPMLineBase64(reportData);

		return Promise.join(getCPMLineBase64, cpmLineBase64 => {
			reportData.report.charts.cpmLine.base64 = cpmLineBase64;

			return reportData;
		});
	}
};
