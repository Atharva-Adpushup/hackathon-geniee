const fs = require('fs'),
	{ imageCharts } = require('../../constants'),
	Config = require('../../../../../configs/config'),
	utils = require('../../../../../helpers/utils'),
	emailConfig = Config.email,
	emailModule = require('emailjs'),
	Promise = require('bluebird'),
	_ = require('lodash'),
	path = require('path'),
	server = emailModule.server.connect({
		user: emailConfig.SMTP_USERNAME,
		password: emailConfig.SMTP_PASSWORD,
		host: emailConfig.SMTP_SERVER,
		ssl: true
	});

function setKeyValuesInTemplate(template, config) {
	return _.reduce(
		config,
		(resultString, value, key) => {
			resultString = resultString.replace(key, value);
			return resultString;
		},
		template
	);
}

function sanitiseUrl(url) {
	return decodeURI(utils.domanize(url));
}

function isMetricDecreaseMoreThan19Percent(inputData, metric) {
	const percentage = inputData.report.metricComparison[metric].percentage,
		change = inputData.report.metricComparison[metric].change,
		isValid = !!(percentage && Number(percentage) > 19 && change && change === 'decreased');

	return isValid;
}

function getTemplateConfig(inputData) {
	const topUrlsObject = inputData.report.topUrls,
		firstUrlObject = topUrlsObject[0],
		secondUrlObject = topUrlsObject[1],
		thirdUrlObject = topUrlsObject[2],
		fourthUrlObject = topUrlsObject[3],
		fifthUrlObject = topUrlsObject[4],
		sixthUrlObject = topUrlsObject[5],
		seventhUrlObject = topUrlsObject[6],
		eigthUrlObject = topUrlsObject[7],
		ninthUrlObject = topUrlsObject[8],
		tenthUrlObject = topUrlsObject[9],
		revenueLastWeekNumber = inputData.report.metricComparison.revenue.lastWeekOriginal,
		revenueThisWeekNumber = inputData.report.metricComparison.revenue.thisWeekOriginal,
		revenueLastWeekOriginalNumber = utils.toFloat(revenueLastWeekNumber),
		revenueThisWeekOriginalNumber = utils.toFloat(revenueThisWeekNumber),
		changeImgPathObject = {
			decreased: 'http://console.adpushup.com/assets/images/down-arrow.png',
			increased: 'http://console.adpushup.com/assets/images/up-arrow.png'
		},
		cpmPercentage = inputData.report.metricComparison.cpm.percentage,
		cpmChange = inputData.report.metricComparison.cpm.change;

	return {
		'@__date_range__@': inputData.report.metricComparison.dates.thisWeek.representation,
		'@__site_name__@': inputData.siteName.toLowerCase(),
		'@__revenue_value__@': Math.round(inputData.report.metricComparison.revenue.thisWeekOriginal),
		'@__cpm_change_text__@': cpmChange,
		'@__cpm_change_value__@': cpmPercentage,
		'@__revenue_change_img__@':
			changeImgPathObject[inputData.report.metricComparison.revenue.change],
		'@__revenue_lastWeek_value__@': revenueLastWeekOriginalNumber,
		'@__revenue_thisWeek_value__@': revenueThisWeekOriginalNumber,
		'@__impression_lastWeek_value__@': inputData.report.metricComparison.impressions.lastWeek,
		'@__impression_thisWeek_value__@': inputData.report.metricComparison.impressions.thisWeek,
		'@__impression_change_img__@':
			changeImgPathObject[inputData.report.metricComparison.impressions.change],
		'@__cpm_lastWeek_value__@': inputData.report.metricComparison.cpm.lastWeek,
		'@__cpm_thisWeek_value__@': inputData.report.metricComparison.cpm.thisWeek,
		'@__cpm_change_img__@': changeImgPathObject[cpmChange],
		'@__topUrl_first_link__@': firstUrlObject.url,
		'@__topUrl_first_value__@': sanitiseUrl(firstUrlObject.url),
		'@__topUrl_first_hits__@': firstUrlObject.count,
		'@__topUrl_second_link__@': secondUrlObject.url,
		'@__topUrl_second_value__@': sanitiseUrl(secondUrlObject.url),
		'@__topUrl_second_hits__@': secondUrlObject.count,
		'@__topUrl_third_link__@': thirdUrlObject.url,
		'@__topUrl_third_value__@': sanitiseUrl(thirdUrlObject.url),
		'@__topUrl_third_hits__@': thirdUrlObject.count,
		'@__topUrl_fourth_link__@': fourthUrlObject.url,
		'@__topUrl_fourth_value__@': sanitiseUrl(fourthUrlObject.url),
		'@__topUrl_fourth_hits__@': fourthUrlObject.count,
		'@__topUrl_fifth_link__@': fifthUrlObject.url,
		'@__topUrl_fifth_value__@': sanitiseUrl(fifthUrlObject.url),
		'@__topUrl_fifth_hits__@': fifthUrlObject.count,
		'@__topUrl_sixth_link__@': sixthUrlObject.url,
		'@__topUrl_sixth_value__@': sanitiseUrl(sixthUrlObject.url),
		'@__topUrl_sixth_hits__@': sixthUrlObject.count,
		'@__topUrl_seventh_link__@': seventhUrlObject.url,
		'@__topUrl_seventh_value__@': sanitiseUrl(seventhUrlObject.url),
		'@__topUrl_seventh_hits__@': seventhUrlObject.count,
		'@__topUrl_eigth_link__@': eigthUrlObject.url,
		'@__topUrl_eigth_value__@': sanitiseUrl(eigthUrlObject.url),
		'@__topUrl_eigth_hits__@': eigthUrlObject.count,
		'@__topUrl_ninth_link__@': ninthUrlObject.url,
		'@__topUrl_ninth_value__@': sanitiseUrl(ninthUrlObject.url),
		'@__topUrl_ninth_hits__@': ninthUrlObject.count,
		'@__topUrl_tenth_link__@': tenthUrlObject.url,
		'@__topUrl_tenth_value__@': sanitiseUrl(tenthUrlObject.url),
		'@__topUrl_tenth_hits__@': tenthUrlObject.count
	};
}

function readTemplateFile() {
	const fileName = path.join(`${__dirname}/`, '../../templates/main.txt');

	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, fileString) => {
			if (err) {
				return reject(err);
			}

			return resolve(fileString.toString());
		});
	});
}

function sendEmail(options) {
	const parameters = {
		from: options.from,
		to: options.to,
		cc: options.cc ? options.cc : '',
		subject: options.subject,
		attachment: options.attachment.concat([])
	};

	return new Promise((resolve, reject) => {
		server.send(parameters, function(err, message) {
			if (err) {
				return reject(err);
			}

			console.log(`Successfully sent email to ${parameters.to}`);
			return resolve(message);
		});
	});
}

function getEmailObject(inputData) {
	const isCPMDecreaseHigh = isMetricDecreaseMoreThan19Percent(inputData, 'cpm');

	return {
		from: emailConfig.MAIL_FROM,
		to: `${inputData.email}, abhinav.choudhri@adpushup.com, anil.panghal@adpushup.com`,
		cc: isCPMDecreaseHigh ? 'support@adpushup.com' : '',
		subject: `AdPushup Performance Report: ${inputData.siteName}`,
		attachment: []
	};
}

function setAttachmentsForEmail(imagesInfoObject, fileString, inputData) {
	const emailOptions = getEmailObject(inputData),
		attachmentArray = [],
		imageAttachmentsArray = [];
	let resultFileString = fileString,
		templateConfig = getTemplateConfig(inputData);

	resultFileString = setKeyValuesInTemplate(resultFileString, templateConfig);

	_.forOwn(imagesInfoObject, imageObject => {
		const attachmentObject = {
				path: imageObject.imagePath,
				type: 'image/png',
				headers: {
					'Content-ID': `<${imageObject.cid}>`,
					'Content-Type': `image/png; name='${imageObject.imageName}.png'`
				}
			},
			templateKey = imageCharts[imageObject.imageName].name.template;

		resultFileString = resultFileString.replace(templateKey, `cid:${imageObject.cid}`);
		imageAttachmentsArray.push(attachmentObject);
	});

	attachmentArray.push({
		data: resultFileString,
		alternative: true
	});
	emailOptions.attachment = attachmentArray.concat(imageAttachmentsArray);

	return Promise.resolve(emailOptions);
}

function processEmail(inputData) {
	const getTemplateFile = readTemplateFile(),
		imagesInfoObject = inputData.report.charts;

	return Promise.join(getTemplateFile, fileString => {
		const isImagesInfoObject = !!(imagesInfoObject && Object.keys(imagesInfoObject).length);

		if (!isImagesInfoObject) {
			throw new Error('processEmail:: Images info object should not be empty');
		}

		if (!fileString) {
			throw new Error('processEmail:: File string should not be empty');
		}

		return setAttachmentsForEmail(imagesInfoObject, fileString, inputData).then(emailOptions =>
			sendEmail(emailOptions)
		);
	})
		.then(mailMessage => {
			if (mailMessage) {
				console.log(`SuccessFully sent email, message: ${mailMessage}`);
			}

			inputData.isEmailSent = true;
			return inputData;
		})
		.catch(err => {
			console.log(`Error occurred while init function execution: ${err.message}`);
			return inputData;
		});
}

module.exports = {
	processEmail
};
