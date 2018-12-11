const request = require('request-promise');
const commonConsts = require('../../configs/commonConsts');
const utils = require('../../helpers/utils');
const { updateDb } = require('./dbHelper');
const syncCdn = require('../genieeAdSyncService/cdnSyncService/index');

function createTransactionLog({ siteId, siteDomain, ads }) {
	let layoutAds = [];
	let apTagAds = [];
	const getTransactionLogData = ad => {
			let {
				isManual,
				formatData,
				network,
				networkData,
				platform = null,
				pageGroup = null,
				variationId = null
			} = ad;
			let injectionTechnique = null;
			let networkAdUnitId = null;
			let status = commonConsts.SETUP_STATUS.ACTIVE;
			let service = commonConsts.TRANSACTION_SERVICES.UNKNOWN;

			if (isManual) {
				if (formatData && formatData.platform) {
					platform = formatData.platform;
				}
				injectionTechnique = commonConsts.INJECTION_TECHNIQUES.TAG;
				variationId = commonConsts.MANUAL_ADS.VARIATION;
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
				if (networkData.headerBidding) {
					service = commonConsts.TRANSACTION_SERVICES.HEADER_BIDDING;
				} else if (networkData.dynamicAllocation) {
					service = commonConsts.TRANSACTION_SERVICES.DYNAMIC_ALLOCATION;
				}
				status = commonConsts.SETUP_STATUS.ACTIVE;
			}

			return {
				platform,
				pageGroup,
				variationId,
				networkAdUnitId,
				service,
				status,
				injectionTechnique
			};
		},
		getSetupLogs = () => {
			if (!ads || !ads.length) {
				return [];
			}

			let setupLogs = [];
			for (let i = 0; i < ads.length; i++) {
				const ad = ads[i];
				const { network } = ad;
				const sectionId = ad.sectionId ? ad.sectionId : ad.id;
				const {
					platform,
					pageGroup,
					variationId,
					networkAdUnitId,
					service,
					status,
					injectionTechnique
				} = getTransactionLogData(ad);

				injectionTechnique === commonConsts.INJECTION_TECHNIQUES.LAYOUT
					? layoutAds.push(ad)
					: apTagAds.push(ad);

				setupLogs.push({
					siteId,
					siteDomain: utils.domanize(siteDomain),
					siteUrl: siteDomain,
					platform,
					pageGroup,
					variationId,
					sectionId,
					network: network || null,
					networkAdUnitId,
					injectionTechnique,
					service,
					status
				});
			}

			return setupLogs;
		};

	const logs = getSetupLogs();
	console.log(logs);

	return request({
		method: 'POST',
		uri: commonConsts.TRANSACTION_LOG_ENDPOINT,
		body: { setupLogs: logs },
		json: true
	})
		.then(response => {
			return updateDb(siteId, layoutAds, apTagAds);
		})
		.then(() => syncCdn(siteId, true))
		.catch(err => {
			console.log(err);
			return Promise.reject(err);
		});
}

module.exports = createTransactionLog;
