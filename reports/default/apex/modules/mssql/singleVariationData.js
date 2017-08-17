const singleChannelVariationData = require('./singleChannelVariationData'),
	extend = require('extend'),
	_ = require('lodash'),
	AdPushupError = require('../../../../../helpers/AdPushupError');

function getMatchedVariationMetrics(id, reportData) {
	const inputReportData = extend(true, {}, reportData),
		isMatchedVariationId = !!(inputReportData.variations.hasOwnProperty(id) && inputReportData.variations[id]);
	var variationData;

	if (!isMatchedVariationId) { throw new AdPushupError('SingleVariationData:: getMatchedVariationMetrics: Variation does not exist'); }

	variationData = extend(true, {}, inputReportData.variations[id]);
	return variationData;
}

function validateReportData(reportData) {
	const inputReportData = extend(true, {}, reportData),
		isValidRootObject = !!(inputReportData && _.isObject(inputReportData) && _.keys(inputReportData).length),
		isValidHeaderArray = !!(isValidRootObject && inputReportData.header && inputReportData.header.length),
		isValidRowsArray = !!(isValidHeaderArray && inputReportData.rows && inputReportData.rows.length),
		isValidFooterArray = !!(isValidRowsArray && inputReportData.footer && inputReportData.footer.length),
		isValidTrackedObject = !!(isValidFooterArray && inputReportData.tracked && _.isObject(inputReportData.tracked) && _.keys(inputReportData.tracked).length),
		isValidTotalObject = !!(isValidTrackedObject && inputReportData.total && _.isObject(inputReportData.total) && _.keys(inputReportData.total).length),
		isValidVariationObject = !!(isValidTotalObject && inputReportData.variations && _.isObject(inputReportData.variations) && _.keys(inputReportData.variations).length);

	if (!isValidVariationObject) { throw new AdPushupError('SingleVariationData:: validateReportData: Invalid variation data'); }

	return inputReportData;
}

module.exports = {
	getData: (inputParamConfig) => {
		return singleChannelVariationData.getData(inputParamConfig)
			.then(validateReportData)
			.then(getMatchedVariationMetrics.bind(null, inputParamConfig.variationId));
	}
};
