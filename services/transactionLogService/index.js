const request = require('request-promise');
const _ = require('lodash');
const commonConsts = require('../../configs/commonConsts');
const utils = require('../../helpers/utils');
const { updateDb } = require('./dbHelper');
const syncCdn = require('../genieeAdSyncService/cdnSyncService/index');

function createTransactionLog({ siteId, siteDomain, ads, publisherName, publisherEmailAddress }) {
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
				variationId = null,
				isControl = false,
				sectionName = '',
				variationName = ''
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
				platform,
				pageGroup,
				variationId,
				networkAdUnitId,
				service,
				status,
				injectionTechnique,
				publisherName,
				publisherEmailAddress,
				sectionName,
				variationName
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
					injectionTechnique,
					publisherName,
					publisherEmailAddress,
					sectionName,
					variationName
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
					status,
					publisherName,
					publisherEmailAddress,
					sectionName,
					variationName
				});
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
				return Promise.reject(errors.join(', '));
			}
			return updateDb(siteId, layoutAds, apTagAds);
		})
		.then(() => syncCdn(siteId, true))
		.catch(err => {
			console.log(err);
			return Promise.reject(err);
		});
}

module.exports = createTransactionLog;
