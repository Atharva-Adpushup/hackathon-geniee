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
			}
		];

		return convertBase64ToImageModule.init(base64Collection).then(imagesCollection => {
			const cpmLineImageInfo = imagesCollection[0],
				adNetworkCPMLineImageInfo = imagesCollection[1];

			inputData.report.charts.cpmLine.base64 = '';
			inputData.report.charts.cpmLine.imageName = cpmLineImageInfo.name;
			inputData.report.charts.cpmLine.imagePath = cpmLineImageInfo.path;
			inputData.report.charts.cpmLine.cid = cpmLineImageInfo.cid;

			inputData.report.charts.adNetworkCPMLine.base64 = '';
			inputData.report.charts.adNetworkCPMLine.imageName = adNetworkCPMLineImageInfo.name;
			inputData.report.charts.adNetworkCPMLine.imagePath = adNetworkCPMLineImageInfo.path;
			inputData.report.charts.adNetworkCPMLine.cid = adNetworkCPMLineImageInfo.cid;

			return inputData;
		});
	}
};
