const request = require('request-promise');
const _ = require('lodash');
const commonConsts = require('../../configs/commonConsts');
const utils = require('../../helpers/utils');
const { updateDb } = require('./dbHelper');
const syncCdn = require('../genieeAdSyncService/cdnSyncService/index');

function createTransactionLog({ siteId, siteDomain, ads, publisherName, publisherEmailAddress }) {
	let layoutAds = [];
	let apTagAds = [];
	let innovativeAds = [];
	const getConstantKeys = ad => {
			let {
				network,
				networkData,
				isManual = false,
				isInnovativeAd = false,
				isControl = false,
				sectionName = ''
			} = ad;
			let injectionTechnique = null;
			let networkAdUnitId = null;
			let status = commonConsts.SETUP_STATUS.ACTIVE;
			let service = commonConsts.TRANSACTION_SERVICES.UNKNOWN;
			let sectionId = ad.sectionId ? ad.sectionId : ad.id;

			// Should Innovative Ad count under Layout??
			if (isManual) {
				injectionTechnique = commonConsts.INJECTION_TECHNIQUES.TAG;
			} else if (isInnovativeAd) {
				injectionTechnique = commonConsts.INJECTION_TECHNIQUES.INNOVATIVE_AD;
			} else {
				injectionTechnique = commonConsts.INJECTION_TECHNIQUES.LAYOUT;
			}

			if (network) {
				switch (network) {
					case commonConsts.NETWORKS.ADPTAGS:
						networkAdUnitId = networkData.dfpAdunit;
						break;
					case commonConsts.NETWORKS.ADSENSE:
					case commonConsts.NETWORKS.ADX:
					case commonConsts.NETWORKS.MEDIANET:
						networkAdUnitId = networkData.adunitId;
						break;
					case commonConsts.NETWORKS.GENIEE:
						networkAdUnitId = String(networkData.zoneId);
						break;
				}
			}

			if (network && networkData) {
				if (networkData.hasOwnProperty('headerBidding')) {
					service = commonConsts.TRANSACTION_SERVICES.HEADER_BIDDING;
					status = networkData.headerBidding
						? commonConsts.SETUP_STATUS.ACTIVE
						: commonConsts.SETUP_STATUS.INACTIVE;
				} else if (networkData.hasOwnProperty('dynamicAllocation')) {
					service = commonConsts.TRANSACTION_SERVICES.DYNAMIC_ALLOCATION;
					status = networkData.dynamicAllocation
						? commonConsts.SETUP_STATUS.ACTIVE
						: commonConsts.SETUP_STATUS.INACTIVE;
				}
			}

			if (isControl) {
				service = commonConsts.TRANSACTION_SERVICES.CONTROL_TAG;
			}

			return {
				injectionTechnique,
				networkAdUnitId,
				network,
				status,
				service,
				sectionName,
				sectionId,
				publisherName,
				publisherEmailAddress,
				siteId,
				siteUrl: siteDomain,
				siteDomain: utils.domanize(siteDomain)
			};
		},
		generateVariationsLogCombo = (constantLogKeys, variations) => {
			return _.map(variations, variation => {
				return {
					...constantLogKeys,
					...variation
				};
			});
		},
		getTransactionLogData = ad => {
			const constantLogKeys = getConstantKeys(ad);
			const logs = generateVariationsLogCombo(constantLogKeys, ad.variations);
			return logs;
		},
		getSetupLogs = () => {
			if (!ads || !ads.length) {
				return [];
			}

			let setupLogs = [];
			for (let i = 0; i < ads.length; i++) {
				const ad = ads[i];
				const logs = getTransactionLogData(ad);

				if (ad.isManual) {
					apTagAds.push(ad);
				} else if (ad.isInnovativeAd) {
					innovativeAds.push(ad);
				} else {
					layoutAds.push(ad);
				}

				setupLogs = setupLogs.concat(logs);
			}

			return setupLogs;
		};

	const logs = getSetupLogs();

	return request({
		method: 'POST',
		uri: commonConsts.TRANSACTION_LOG_ENDPOINT,
		body: { setupLogs: logs },
		json: true
	})
		.then(response => {
			if (response.code != 1) {
				const errors = _.map(response.FailedLogs, log => log.error);
				return Promise.reject(new Error(errors.join(', ')));
			}
			return updateDb(siteId, layoutAds, apTagAds, innovativeAds);
		})
		.then(() => syncCdn(siteId, true))
		.catch(err => {
			console.log(err);
			return Promise.reject(err);
		});
}

module.exports = createTransactionLog;
