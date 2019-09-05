const path = require('path');
const Promise = require('bluebird');
const url = require('url');
const retry = require('bluebird-retry');
const fs = Promise.promisifyAll(require('fs'));
const mkdirpAsync = Promise.promisifyAll(require('mkdirp')).mkdirpAsync;
const readFileAsync = Promise.promisify(require('fs').readFile);

const commonConsts = require('../../configs/commonConsts');
couchbase = require('../../helpers/couchBaseService');

function constructHBJsFile(jsContents, indiHbConfig, siteData) {
	const hostname = url.parse(siteData.siteDomain).hostname;

	const domainNames = [hostname];

	const hbGlobalSettings = siteData.hbConfig.settings;

	if (!hostname.match('^www.')) {
		domainNames.push(`www.${hostname}`);
	}

	jsContents = jsContents
		.replace('__HB_SITE_ID__', siteData.siteId)
		.replace('__HB_SITE_DOMAINS__', JSON.stringify(domainNames))
		.replace('__HB_BIDDING_PARTNERS__', JSON.stringify(indiHbConfig.info))
		.replace('__HB_FEEDBACK_URL__', JSON.stringify(hbGlobalSettings.e3FeedbackUrl))
		.replace('__HB_PREBID_TIMEOUT__', hbGlobalSettings.prebidTimeout || 5000)
		.replace('__HB_BID_CPM_ADJUSTMENTS__', JSON.stringify(commonConsts.bidCpmAdjustments || {}));

	if (siteData.hbConfig.targetAllDFP) {
		jsContents = jsContents.replace('__HB_TARGET_ALL_DFP__', true);
	} else {
		jsContents = jsContents
			.replace('__HB_TARGET_ALL_DFP__', false)
			.replace('__HB_POSTBID_PASSBACKS__', JSON.stringify(hbGlobalSettings.postbidPassbacks || {}))
			.replace(
				'__HB_AD_UNIT_TARGETING__',
				JSON.stringify(hbGlobalSettings.dfpAdUnitTargeting || {})
			);
	}

	return jsContents;
}

module.exports = function(siteId) {
	const jsTplPath = path.join(
		__dirname,
		'..',
		'..',
		'public',
		'assets',
		'js',
		'builds',
		'adpushupHB.js'
	);

	const hbRootPath = path.join('/adpushup', 'hb_files', siteId.toString());

	return couchbase
		.connectToBucket('AppBucket')
		.then(appBucket =>
			Promise.all([
				appBucket.getAsync(`${commonConsts.docKeys.hb}${siteId}`, {}),
				readFileAsync(jsTplPath),
				mkdirpAsync(hbRootPath)
			])
		)
		.spread((siteData, jsContents) => {
			jsContents = jsContents.toString();
			siteData = siteData.value;

			return Promise.all(
				siteData.hbConfig.setup.map(indiHbConfig => {
					if (indiHbConfig.type === 'all') {
						return fs.writeFileAsync(
							path.join(hbRootPath, 'adpushup.GLOBAL.js'),
							constructHBJsFile(jsContents, indiHbConfig, siteData)
						);
					}
					if (indiHbConfig.type === 'continent') {
						return fs.writeFileAsync(
							path.join(hbRootPath, `adpushup.${indiHbConfig.continent}.js`),
							constructHBJsFile(jsContents, indiHbConfig, siteData)
						);
					}
					return fs.writeFileAsync(
						path.join(hbRootPath, `adpushup.${indiHbConfig.country}.js`),
						constructHBJsFile(jsContents, indiHbConfig, siteData)
					);
				})
			);
		});
};
