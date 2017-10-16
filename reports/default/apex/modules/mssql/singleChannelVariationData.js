const sqlQueryModule = require('../../../common/mssql/queryHelpers/singleChannelVariationData'),
	Promise = require('bluebird'),
	AdPushupError = require('../../../../../helpers/AdPushupError'),
	extend = require('extend'),
	lodash = require('lodash');

function transformVariationData(reportData) {
	const computedData = {
			header: ['Variation', 'CTR (PERFORMANCE %)', 'Traffic (%)'],
			rows: [],
			footer: new Array(3),
			tracked: {
				pageViews: 0,
				click: 0,
				impression: 0,
				pageCTR: 0.0
			},
			total: {
				pageViews: 0,
				click: 0,
				impression: 0
			},
			variations: {}
		},
		isReportData = !!(reportData && lodash.isObject(reportData) && lodash.keys(reportData).length);

	if (!isReportData) {
		throw new AdPushupError('Invalid variation data');
	}
	computedData.footer.fill(' ');

	lodash.forOwn(reportData, (variationObject, variationKey) => {
		const row = new Array(3),
			pageCTR = variationObject.tracked.pageCTR,
			isValidVariation = !!(variationObject && variationObject.id);
		let variationObjectPlaceHolder;

		if (!isValidVariation) {
			return;
		}

		variationObjectPlaceHolder = extend(true, {}, variationObject);
		delete variationObjectPlaceHolder.dayWisePageViews;
		delete variationObjectPlaceHolder.days;
		delete variationObjectPlaceHolder.customJs;
		delete variationObjectPlaceHolder.sections;
		computedData.variations[variationKey] = extend(true, {}, variationObjectPlaceHolder);
		variationObjectPlaceHolder = null;

		row[0] = variationObject.id;
		row[1] = pageCTR;
		row[2] = variationObject.trafficDistribution;

		computedData.rows.push(row);
		computedData.tracked[pageCTR] = {
			pageViews: variationObject.tracked.pageViews,
			adClicks: variationObject.tracked.click
		};
		computedData.tracked.pageViews += variationObject.tracked.pageViews;
		computedData.tracked.click += variationObject.tracked.click;
		computedData.tracked.impression += variationObject.tracked.impression;

		computedData.total.pageViews += variationObject.pageViews;
		computedData.total.click += variationObject.click;
		computedData.total.impression += variationObject.impression;
	});

	return computedData;
}

module.exports = {
	getData: paramConfig => {
		return sqlQueryModule.getData(paramConfig).then(transformVariationData);
	},
	transformData: transformVariationData
};
