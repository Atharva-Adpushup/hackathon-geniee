const URL = require('url-parse');
const rp = require('request-promise');
const { apiUrl } = require('./constants/constants');

module.exports = {
	getPageViews: dataConfig => {
		const decodedUrl = decodeURIComponent(apiUrl);
		const parsedUrl = URL(decodedUrl, true);
		const queryObj = Object.assign({}, parsedUrl.query);

		queryObj.filters = queryObj.filters
			.replace('__mode__', dataConfig.mode)
			.replace('__siteId__', dataConfig.siteId)
			.replace('__variationId__', dataConfig.variationId)
			.replace('__platform__', dataConfig.platform);
		queryObj.timeframe = queryObj.timeframe
			.replace('__startDate__', dataConfig.startDate)
			.replace('__endDate__', dataConfig.endDate);
		parsedUrl.set('query', queryObj);

		return rp(parsedUrl.href).then(data => {
			let responseData = typeof data === 'string' ? JSON.parse(data) : data;
			const isResultData = !!(responseData && responseData.result && responseData.result.length);

			if (!isResultData) {
				throw new Error('PageViews: Result data is empty');
			}

			responseData = responseData.result[0];
			return responseData.result;
		});
	}
};
