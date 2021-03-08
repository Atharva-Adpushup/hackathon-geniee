const Promise = require('bluebird');
const extend = require('extend');
const moment = require('moment');
const { LINE_CHART_CONFIG, PIE_CHART_CONFIG } = require('../../constants');
const config = require('../../../../../configs/config');
const { roundOffTwoDecimal, uploadImageToAzure, getBase64Image } = require('../../../cronhelpers');

function generateImageUploadPath(metaData) {
	const { fromReportingDate = '', toReportingDate = '', type = '', siteids = '' } = metaData;
	let imageUploadPath = `${fromReportingDate}-${toReportingDate}-${type}-${siteids}`;
	imageUploadPath = imageUploadPath.replace(/ /g, '-').replace(/,/g, '-');
	return imageUploadPath;
}

function addHighChartsObject(inputData, metaData) {
	const defaultChartObject = {
		base64: '',
		imagePath: ''
	};
	inputData.charts = {
		cpmLine: { ...defaultChartObject },
		adNetworkRevenuePie: { ...defaultChartObject },
		countryReportPie: { ...defaultChartObject }
	};
	imageUploadPath = generateImageUploadPath(metaData);
	return { inputData, imageUploadPath };
}

function getChartImageOptions() {
	return {
		width: 487,
		scale: 2,
		b64: true
	};
}

async function processChartAndgGiveUploadPath(imgOptions, chartOptions, imagePath) {
	const newOptions = { ...imgOptions, options: { ...chartOptions } };
	const base64Data = await getBase64Image(newOptions);
	const buffer = await Buffer.from(base64Data, 'base64');
	await uploadImageToAzure(imagePath, buffer);
	return `${config.weeklyDailySnapshots.BASE_PATH}${imagePath}`;
}

//required
async function uploadCPMChartAndGetSourcePath(inputData, imageUploadPath) {
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
	const imageSourcePath = await processChartAndgGiveUploadPath(
		imageOptions,
		chartConfig,
		imageUploadPath + 'cpm.png'
	);
	return imageSourcePath;
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
async function uploadAdNetworkPieChartAndGetSourcePath(inputData, imageUploadPath) {
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
	const imageSourcePath = await processChartAndgGiveUploadPath(
		imageOptions,
		chartConfig,
		imageUploadPath + 'network.png'
	);
	return imageSourcePath;
}

//required
async function uploadCountryPieChartAndGetSourcePath(inputData, imageUploadPath) {
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
	const imageSourcePath = await processChartAndgGiveUploadPath(
		imageOptions,
		chartConfig,
		imageUploadPath + 'country.png'
	);
	return imageSourcePath;
}

module.exports = {
	generateAndProcessCharts: (inputData, metaData) => {
		const { inputData: reportData, imageUploadPath } = addHighChartsObject(inputData, metaData),
			getCPMLineSourcePath = uploadCPMChartAndGetSourcePath(reportData, imageUploadPath),
			getAdNetworkRevenuePieSourcePath = uploadAdNetworkPieChartAndGetSourcePath(
				reportData,
				imageUploadPath
			),
			getCountryRevenueRevenuePieSourcePath = uploadCountryPieChartAndGetSourcePath(
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
				throw new Error(`Error in creating images using highcharts${error}`);
			});
	}
};
