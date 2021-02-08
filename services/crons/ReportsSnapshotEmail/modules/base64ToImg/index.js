const Promise = require('bluebird'),
	_ = require('lodash'),
	convertBase64ToImageModule = require('./convertBase64ToImage');

module.exports = {
	generateImages: inputData => {
		const base64Collection = [
			{
				name: 'cpmLineChart',
				data: inputData.report.charts.cpmLine.base64,
				path: `${__dirname}/`
			},
			{
				name: 'adNetworkCPMLineChart',
				data: inputData.report.charts.adNetworkCPMLine.base64,
				path: `${__dirname}/`
			},
			{
				name: 'adNetworkRevenuePieChart',
				data: inputData.report.charts.adNetworkRevenuePie.base64,
				path: `${__dirname}/`
			},
			{
				name: 'deviceRevenuePieChart',
				data: inputData.report.charts.deviceRevenuePie.base64,
				path: `${__dirname}/`
			},
			{
				name: 'pageGroupRevenuePieChart',
				data: inputData.report.charts.pageGroupRevenuePie.base64,
				path: `${__dirname}/`
			}
		];

		return convertBase64ToImageModule.init(base64Collection).then(imagesCollection => {
			const cpmLineImageInfo = imagesCollection[0],
				adNetworkCPMLineImageInfo = imagesCollection[1],
				adNetworkRevenuePieImageInfo = imagesCollection[2],
				deviceRevenuePieImageInfo = imagesCollection[3],
				pageGroupRevenuePieImageInfo = imagesCollection[4];

			inputData.report.charts.cpmLine.base64 = '';
			inputData.report.charts.cpmLine.imageName = cpmLineImageInfo.name;
			inputData.report.charts.cpmLine.imagePath = cpmLineImageInfo.path;
			inputData.report.charts.cpmLine.cid = cpmLineImageInfo.cid;

			inputData.report.charts.adNetworkCPMLine.base64 = '';
			inputData.report.charts.adNetworkCPMLine.imageName = adNetworkCPMLineImageInfo.name;
			inputData.report.charts.adNetworkCPMLine.imagePath = adNetworkCPMLineImageInfo.path;
			inputData.report.charts.adNetworkCPMLine.cid = adNetworkCPMLineImageInfo.cid;

			inputData.report.charts.adNetworkRevenuePie.base64 = '';
			inputData.report.charts.adNetworkRevenuePie.imageName = adNetworkRevenuePieImageInfo.name;
			inputData.report.charts.adNetworkRevenuePie.imagePath = adNetworkRevenuePieImageInfo.path;
			inputData.report.charts.adNetworkRevenuePie.cid = adNetworkRevenuePieImageInfo.cid;

			inputData.report.charts.deviceRevenuePie.base64 = '';
			inputData.report.charts.deviceRevenuePie.imageName = deviceRevenuePieImageInfo.name;
			inputData.report.charts.deviceRevenuePie.imagePath = deviceRevenuePieImageInfo.path;
			inputData.report.charts.deviceRevenuePie.cid = deviceRevenuePieImageInfo.cid;

			inputData.report.charts.pageGroupRevenuePie.base64 = '';
			inputData.report.charts.pageGroupRevenuePie.imageName = pageGroupRevenuePieImageInfo.name;
			inputData.report.charts.pageGroupRevenuePie.imagePath = pageGroupRevenuePieImageInfo.path;
			inputData.report.charts.pageGroupRevenuePie.cid = pageGroupRevenuePieImageInfo.cid;

			return inputData;
		});
	}
};
