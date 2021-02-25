const Promise = require('bluebird');
const extend = require('extend');
const moment = require('moment');
const { LINE_CHART_CONFIG, PIE_CHART_CONFIG } = require('../../constants');
const exporter = require('highcharts-export-server');
const config = require('../../../../../configs/config');
const { roundOffTwoDecimal, uploadImageToAzure } = require('../../../cronhelpers');

function addHighChartsObject(inputData, uniqueIdentifier) {
	const { fromReportingDate = '', toReportingDate = '', type = '', siteid = '' } = uniqueIdentifier;
	const defaultChartObject = {
			base64: '',
			imagePath: ''
		},
		resultData = { ...inputData };
	resultData.charts = {
		cpmLine: extend({}, defaultChartObject),
		adNetworkRevenuePie: extend({}, defaultChartObject),
		countryReportPie: extend({}, defaultChartObject)
	};
	let imageUploadPath = `${fromReportingDate}-${toReportingDate}-${type}-${siteid}`;
	imageUploadPath = imageUploadPath.replace(/ /g, '-');
	return { resultData, imageUploadPath };
}

function getChartImageOptions() {
	return {
		width: 487,
		scale: 2,
		b64: true
	};
}

exporter.initPool();

function generateBase64(imgOptions, chartOptions, imagPath) {
	const newOptions = { ...imgOptions, options: { ...chartOptions } };
	return new Promise((resolve, reject) => {
		exporter.export(newOptions, async function(err, res) {
			if (err) {
				return reject('generateBase64: Unable to generate high chart base64');
			}
			const base64Data = res.data;
			const buffer = await Buffer.from(base64Data, 'base64');
			await uploadImageToAzure(imagPath, buffer);
			return resolve(config.weeklyDailySnapshots.BASE_PATH + imagPath);
		});
	});
}

//required
async function generateCPMLineSourcePath(inputData, imageUploadPath) {
	function computeGraphData(results) {
		let series = [];
		const adpushupSeriesData = [];
		const baselineSeriesData = [];
		const xAxis = { categories: [] };

		if (results.length) {
			results.sort((a, b) => {
				const dateA = a.report_date;
				const dateB = b.report_date;
				if (dateA < dateB) {
					return -1;
				}
				if (dateA > dateB) {
					return 1;
				}
				return 0;
			});

			results.forEach(result => {
				adpushupSeriesData.push(result.adpushup_variation_page_cpm);
				baselineSeriesData.push(result.original_variation_page_cpm);
				xAxis.categories.push(moment(result.report_date).format('ll'));
			});

			series = [
				{
					data: adpushupSeriesData,
					name: 'Page RPM Variation - AdPushup',
					value: 'adpushup_variation_page_cpm',
					valueType: 'money'
				},
				{
					data: baselineSeriesData,
					name: 'Page RPM Variation - Without AdPushup',
					value: 'original_variation_page_cpm',
					valueType: 'money'
				}
			];
		}

		const computedState = {
			series,
			xAxis
		};
		return computedState;
	}

	const { APvsBaseline = {} } = inputData;
	const computedState = computeGraphData(APvsBaseline.result || []);
	const chartConfig = { ...LINE_CHART_CONFIG, ...computedState };
	const imageOptions = getChartImageOptions();
	const base64Encoding = await generateBase64(
		imageOptions,
		chartConfig,
		imageUploadPath + 'cpm.png'
	);
	return base64Encoding;
}

function computeDisplayData(props) {
	const {
		result: resultData,
		chartLegend,
		chartSeriesLabel,
		chartSeriesMetric,
		chartSeriesMetricType
	} = props;
	const series = [
		{
			name: chartLegend,
			colorByPoint: true,
			data: []
		}
	];
	const seriesData = [];

	if (resultData) {
		resultData.forEach(result => {
			seriesData.push({
				name: result[chartSeriesLabel],
				y: parseFloat(roundOffTwoDecimal(result[chartSeriesMetric])),
				valueType: chartSeriesMetricType
			});
		});
	}

	series[0].data = seriesData.sort((a, b) => a.y - b.y);
	return series;
}

//required
async function generateAdNetworkRevenuePieSourcePath(inputData, imageUploadPath) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG);
	const { revenueByNetwork: { result = [] } = {} } = inputData;
	const computedState = computeDisplayData({
		result,
		chartLegend: 'Revenue',
		chartSeriesLabel: 'network',
		chartSeriesMetric: 'revenue',
		chartSeriesMetricType: 'money'
	});
	chartConfig.series = computedState || {};
	const imageOptions = getChartImageOptions();
	const base64Encoding = await generateBase64(
		imageOptions,
		chartConfig,
		imageUploadPath + 'network.png'
	);
	return base64Encoding;
}

//required
async function generateCountryReportsPieSourcePath(inputData, imageUploadPath) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG);
	const { countryReport: { result = [] } = {} } = inputData;
	const computedState = computeDisplayData({
		result,
		chartLegend: 'Country',
		chartSeriesLabel: 'country',
		chartSeriesMetric: 'adpushup_page_views',
		chartSeriesMetricType: 'number'
	});
	chartConfig.series = computedState || {};
	const imageOptions = getChartImageOptions();
	const base64Encoding = await generateBase64(
		imageOptions,
		chartConfig,
		imageUploadPath + 'country.png'
	);
	return base64Encoding;
}

module.exports = {
	generateImageSourcePath: (inputData, uniqueIdentifier) => {
		const { resultData: reportData, imageUploadPath } = addHighChartsObject(
				inputData,
				uniqueIdentifier
			),
			getCPMLineSourcePath = generateCPMLineSourcePath(reportData, imageUploadPath),
			getAdNetworkRevenuePieSourcePath = generateAdNetworkRevenuePieSourcePath(
				reportData,
				imageUploadPath
			),
			getCountryRevenueRevenuePieSourcePath = generateCountryReportsPieSourcePath(
				reportData,
				imageUploadPath
			);
		return Promise.all([
			getCPMLineSourcePath,
			getAdNetworkRevenuePieSourcePath,
			getCountryRevenueRevenuePieSourcePath
		])
			.then(values => {
				reportData.charts.cpmLine.imagePath = values[0];
				reportData.charts.adNetworkRevenuePie.imagePath = values[1];
				reportData.charts.countryReportPie.imagePath = values[2];
				return reportData;
			})
			.catch(error => {
				return Promise.reject(new Error(`Error in creating images using highcharts${error}`));
			});
	}
};
