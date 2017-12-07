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
		cpmLine: extend({}, defaultChartObject),
		adNetworkCPMLine: extend({}, defaultChartObject),
		adNetworkRevenuePie: extend({}, defaultChartObject),
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
		lastWeekSeries.data.push(cpmValue);
	});

	_.forOwn(contributionData.thisWeek, (cpmValue, dateKey) => {
		const dayCategory = moment(dateKey).format('ddd');

		categories.push(dayCategory);
		thisWeekSeries.data.push(cpmValue);
	});

	chartConfig.series.push(lastWeekSeries);
	chartConfig.series.push(thisWeekSeries);
	chartConfig.xAxis.categories = chartConfig.xAxis.categories.concat(categories);

	return generateBase64(imageOptions, chartConfig);
}

function generateAdNetworkCPMLineBase64(inputData) {
	const chartConfig = extend(true, {}, LINE_CHART_CONFIG),
		imageOptions = getChartImageOptions(),
		categories = [],
		contributionData = extend(true, {}, inputData.report.adNetworkDataContribution.dayWise);

	_.forOwn(contributionData, (adNetworkDayWiseReport, adNetworkKey) => {
		const seriesObject = {
				name: adNetworkKey,
				data: []
			},
			// Below condition is added to avoid 'categories' array stuffed with redundant
			// day values.
			isCategoriesValidLength = !!(categories && categories.length + 1 <= 7),
			isChartConfigCategoriesEmptyLength = !!chartConfig.xAxis.categories.length;

		_.forOwn(adNetworkDayWiseReport, (dayWiseObject, dateKey) => {
			if (isCategoriesValidLength) {
				const dayCategory = moment(dateKey).format('MMM DD');
				categories.push(dayCategory);
			}

			seriesObject.data.push(dayWiseObject.cpm);
		});

		chartConfig.series.push(seriesObject);

		if (isCategoriesValidLength || !isChartConfigCategoriesEmptyLength) {
			chartConfig.xAxis.categories = chartConfig.xAxis.categories.concat(categories);
		}
	});

	return generateBase64(imageOptions, chartConfig);
}

function generateAdNetworkRevenuePieBase64(inputData) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG),
		imageOptions = getChartImageOptions(),
		contributionData = extend(true, {}, inputData.report.adNetworkDataContribution.contribution.revenue);

	_.forOwn(contributionData, (adNetworkRevenue, adNetworkKey) => {
		const seriesObject = {
			name: adNetworkKey,
			y: adNetworkRevenue
		};

		chartConfig.series[0].data.push(seriesObject);
	});

	return generateBase64(imageOptions, chartConfig);
}

function generateDeviceRevenuePieBase64(inputData) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG),
		imageOptions = getChartImageOptions(),
		contributionData = extend(true, {}, inputData.report.deviceRevenueContribution.contribution);

	_.forOwn(contributionData, (deviceRevenue, deviceKey) => {
		const seriesObject = {
			name: deviceKey,
			y: deviceRevenue
		};

		chartConfig.series[0].data.push(seriesObject);
	});

	return generateBase64(imageOptions, chartConfig);
}

function generatePageGroupRevenuePieBase64(inputData) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG),
		imageOptions = getChartImageOptions(),
		contributionData = extend(true, {}, inputData.report.pageGroupRevenueContribution.contribution);

	_.forOwn(contributionData, (pageGroupRevenue, pageGroupKey) => {
		const seriesObject = {
			name: pageGroupKey,
			y: pageGroupRevenue
		};

		chartConfig.series[0].data.push(seriesObject);
	});

	return generateBase64(imageOptions, chartConfig);
}

module.exports = {
	generateImageBase64: inputData => {
		const reportData = addHighChartsObject(inputData),
			getCPMLineBase64 = generateCPMLineBase64(reportData),
			getAdNetworkCPMLineBase64 = generateAdNetworkCPMLineBase64(reportData),
			getAdNetworkRevenuePieBase64 = generateAdNetworkRevenuePieBase64(reportData),
			getDeviceRevenuePieBase64 = generateDeviceRevenuePieBase64(reportData),
			getPageGroupRevenuePieBase64 = generatePageGroupRevenuePieBase64(reportData);

		return Promise.join(
			getCPMLineBase64,
			getAdNetworkCPMLineBase64,
			getAdNetworkRevenuePieBase64,
			getDeviceRevenuePieBase64,
			getPageGroupRevenuePieBase64,
			(
				cpmLineBase64,
				adNetworkCPMLineBase64,
				adNetworkRevenuePieBase64,
				deviceRevenuePieBase64,
				pageGroupRevenuePieBase64
			) => {
				reportData.report.charts.cpmLine.base64 = cpmLineBase64;
				reportData.report.charts.adNetworkCPMLine.base64 = adNetworkCPMLineBase64;
				reportData.report.charts.adNetworkRevenuePie.base64 = adNetworkRevenuePieBase64;
				reportData.report.charts.deviceRevenuePie.base64 = deviceRevenuePieBase64;
				reportData.report.charts.pageGroupRevenuePie.base64 = pageGroupRevenuePieBase64;

				return reportData;
			}
		);
	}
};
