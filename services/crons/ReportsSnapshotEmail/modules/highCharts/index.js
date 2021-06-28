const Promise = require('bluebird');
const extend = require('extend');
const moment = require('moment');
const { LINE_CHART_CONFIG, PIE_CHART_CONFIG } = require('../../constants');
const config = require('../../../../../configs/config');
const {
	roundOffTwoDecimal,
	uploadImageToAzure,
	getBase64Image,
	roundOffOneDecimal,
	stringifyObjectsWithFunctions
} = require('../../../cronhelpers');

function generateImageUploadPath(metaData) {
	const { fromReportingDate = '', toReportingDate = '', type = '', siteids = '' } = metaData;
	let imageUploadPath = `${fromReportingDate}-${toReportingDate}-${type}-${siteids}`;
	imageUploadPath = imageUploadPath.replace(/ /g, '_').replace(/,/g, '_');
	return imageUploadPath;
}

function addHighChartsObject(inputData) {
	const defaultChartObject = {
		base64: '',
		imagePath: ''
	};
	inputData.charts = {
		cpmLine: { ...defaultChartObject },
		adNetworkRevenuePie: { ...defaultChartObject },
		countryReportPie: { ...defaultChartObject }
	};
	return { inputData };
}

function getChartImageOptions() {
	return {
		width: 800,
		scale: 1.5,
		b64: true
	};
}

async function processChartAndgGiveUploadPath(imgOptions, chartOptions, imagePath) {
	const newOptions = {
		...imgOptions,
		options: stringifyObjectsWithFunctions({ ...chartOptions }, 'options')
	};
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
		const xAxis = {
			categories: [],
			labels: {
				// eslint-disable-next-line no-template-curly-in-string

				formatter: function() {
					return (
						"<div style='font-family: Arial;color:#2A2733!important;font-weight: 600;'>" +
						this.value +
						'</div>'
					);
				}
			}
		};

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
				xAxis.categories.push(moment(result.report_date).format('MMM Do'));
			});

			series = [
				{
					data: adpushupSeriesData,
					name: 'Page RPM Variation - AdPushup',
					value: 'adpushup_variation_page_cpm',
					valueType: 'money',
					color: '#f64f5b'
				},
				{
					data: baselineSeriesData,
					name: 'Page RPM Variation - Without AdPushup',
					value: 'original_variation_page_cpm',
					valueType: 'money',
					color: '#c1a6b6'
				}
			];
		}

		const computedState = {
			series,
			xAxis
		};
		return computedState;
	}

	const { APvsBaseline = {}, isApVsBaslineChartShown = false } = inputData;
	if (!isApVsBaslineChartShown) return '';
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
	const plotOptions = {
		pie: {
			size: '75%',
			data: []
		}
	};

	const sortedResultData = resultData.sort((first, second) => {
		const metricValueOfFirst = first[chartSeriesMetric];
		const metricValueOfSecond = second[chartSeriesMetric];
		return metricValueOfSecond - metricValueOfFirst;
	});

	let sumOfAllMetric = 0;

	for (let i = 0; i < resultData.length; i++) {
		sumOfAllMetric += resultData[i][chartSeriesMetric] || 0;
	}

	const seriesData = [];
	let otherSeriesSum = 0;
	let indexTillChartToBeShown = null;
	if (sortedResultData) {
		sortedResultData.forEach((result, index) => {
			const percent = roundOffOneDecimal(((result[chartSeriesMetric] || 0) / sumOfAllMetric) * 100);
			seriesData.push({
				name: result[chartSeriesLabel] || 'slice',
				y: parseFloat(roundOffTwoDecimal(result[chartSeriesMetric])),
				valueType: chartSeriesMetricType,
				percent
			});
			if (percent < 5) {
				if (!indexTillChartToBeShown) indexTillChartToBeShown = index;
				otherSeriesSum += result[chartSeriesMetric] || 0;
			}
		});
	}

	plotOptions.pie.data = seriesData.slice(0, indexTillChartToBeShown);
	const seriesDataForTable = seriesData.slice(indexTillChartToBeShown, sortedResultData.length);
	while (plotOptions.pie.data.length < 5) {
		const nextSeriesTableData = seriesDataForTable.shift();
		plotOptions.pie.data.push(nextSeriesTableData);
		otherSeriesSum -= nextSeriesTableData['y'];
	}

	plotOptions.pie.data.push({
		name: 'Others',
		y: parseFloat(roundOffTwoDecimal(otherSeriesSum)),
		valueType: chartSeriesMetricType,
		percent: roundOffOneDecimal((otherSeriesSum / sumOfAllMetric) * 100)
	});
	return { computedState: plotOptions, seriesDataForTable };
}

//required
async function uploadAdNetworkPieChartAndGetSourcePath(inputData, imageUploadPath) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG);
	const { revenueByNetwork: { result = [] } = {} } = inputData;
	const { computedState, seriesDataForTable: networkSeriesDataForTable } = computeDisplayData({
		result,
		chartLegend: 'Revenue',
		chartSeriesLabel: 'network',
		chartSeriesMetric: 'revenue',
		chartSeriesMetricType: 'money'
	});
	chartConfig.plotOptions = computedState || {};
	const imageOptions = getChartImageOptions();
	const imageSourcePath = await processChartAndgGiveUploadPath(
		imageOptions,
		chartConfig,
		imageUploadPath + 'network.png'
	);
	return { imageSourcePath, networkSeriesDataForTable };
}

//required
async function uploadCountryPieChartAndGetSourcePath(inputData, imageUploadPath) {
	const chartConfig = extend(true, {}, PIE_CHART_CONFIG);
	const { countryReports: { result = [] } = {} } = inputData;
	const { computedState, seriesDataForTable: countrySeriesDataForTable } = computeDisplayData({
		result,
		chartLegend: 'Country',
		chartSeriesLabel: 'country',
		chartSeriesMetric: 'adpushup_page_views',
		chartSeriesMetricType: 'number'
	});
	chartConfig.plotOptions = computedState || {};
	const imageOptions = getChartImageOptions();
	const imageSourcePath = await processChartAndgGiveUploadPath(
		imageOptions,
		chartConfig,
		imageUploadPath + 'country.png'
	);
	return { imageSourcePath, countrySeriesDataForTable };
}

module.exports = {
	generateAndProcessCharts: (inputData, metaData) => {
		const { inputData: reportData } = addHighChartsObject(inputData);
		const imageUploadPath = generateImageUploadPath(metaData);
		const getCPMLineSourcePath = uploadCPMChartAndGetSourcePath(reportData, imageUploadPath);
		const getAdNetworkRevenuePieSourcePath = uploadAdNetworkPieChartAndGetSourcePath(
			reportData,
			imageUploadPath
		);
		const getCountryRevenueRevenuePieSourcePath = uploadCountryPieChartAndGetSourcePath(
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
				reportData.charts.adNetworkRevenuePie.imagePath = values[1].imageSourcePath || '';
				reportData.charts.adNetworkRevenuePie.networkSeriesDataForTableLeft =
					values[1].networkSeriesDataForTable.slice(0, 5) || [];
				reportData.charts.adNetworkRevenuePie.networkSeriesDataForTableRight =
					values[1].networkSeriesDataForTable.slice(5, 10) || [];
				reportData.charts.countryReportPie.imagePath = values[2].imageSourcePath || '';
				reportData.charts.countryReportPie.countrySeriesDataForTableLeft =
					values[2].countrySeriesDataForTable.slice(0, 5) || [];
				reportData.charts.countryReportPie.countrySeriesDataForTableRight =
					values[2].countrySeriesDataForTable.slice(5, 10) || [];
				return reportData;
			})
			.catch(error => {
				throw new Error(`Error in creating images using highcharts${error}`);
			});
	}
};
