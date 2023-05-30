/* eslint-disable no-restricted-syntax */
const request = require('request-promise');
const Promise = require('bluebird');
const couchbase = require('../helpers/couchBaseService');
const commonConsts = require('../configs/commonConsts');

const getMetaInfoConfigDocName = (productName = '', isSuperUser) => {
	const productNameLower = productName && productName.toLowerCase();
	switch (productNameLower) {
		case commonConsts.URL_REPORTING_PRODUCT:
			return commonConsts.URL_REPORTING_REPORT_CONFIG;
		case commonConsts.HB_ANALYTICS_PRODUCT:
			return commonConsts.HB_ANALYTICS_REPORT_CONFIG;
		default:
			return isSuperUser ? commonConsts.OPERATIONS_REPORT_CONFIG : commonConsts.USER_REPORT_CONFIG;
	}
};

const getMetaInfoConfigDocValues = configFile => {
	return couchbase.connectToAppBucket().then(appBucket => {
		return appBucket.getAsync(configFile);
	}).then(metaInfoConfigDocValues => metaInfoConfigDocValues.value);
};

const getSiteMetaData = params =>
	request({
		uri: `${commonConsts.ANALYTICS_METAINFO_BASE}${commonConsts.ANALYTICS_METAINFO_URL}`,
		json: true,
		qs: params
	});

const getMetaInfo = params =>
	new Promise((resolve, reject) => {
		const { product, isSuperUser } = params;
		const configFileName = getMetaInfoConfigDocName(product, isSuperUser);
		const siteMetaDataPromise = getSiteMetaData(params);
		const siteMetaConfigPromise = getMetaInfoConfigDocValues(configFileName);
		Promise.all([siteMetaDataPromise, siteMetaConfigPromise])
			.then(([siteMetaData, metaConfigFile]) => {
                siteMetaData.data = {
					...siteMetaData.data,
					...metaConfigFile
				};
				return resolve(siteMetaData);
			})
			.catch(err => {
				return reject(err);
			});
	});
module.exports = {
	getMetaInfo
};