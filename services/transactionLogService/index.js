const request = require('request-promise');
const commonConsts = require('../../configs/commonConsts');
const utils = require('../../helpers/utils');

function createTransactionLog(siteId, siteDomain, ads) {
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

			if (network && networkData.headerBidding) {
				service = commonConsts.TRANSACTION_SERVICES.HEADER_BIDDING;
				status = commonConsts.SETUP_STATUS.ACTIVE;
			}

			return { platform, pageGroup, variationId, networkAdUnitId, service, status, injectionTechnique };
		},
		getSetupLogs = () => {
			if (!ads || !ads.length) {
				return [];
			}

			let setupLogs = [];
			for (let i = 0; i < ads.length; i++) {
				const ad = ads[i];

				// if (ad.network && ad.network === commonConsts.NETWORKS.ADPTAGS) {
				// 	continue; // In case of adpTags, transaction API call is to be made from queueworker where the dfpAdunit is assigned
				// }

				const { id: sectionId, network } = ad,
					{
						platform,
						pageGroup,
						variationId,
						networkAdUnitId,
						service,
						status,
						injectionTechnique
					} = getTransactionLogData(ad);

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

	return request({
		method: 'POST',
		uri: commonConsts.TRANSACTION_LOG_ENDPOINT,
		body: { setupLogs: getSetupLogs() },
		json: true
	});
}

module.exports = { createTransactionLog };
