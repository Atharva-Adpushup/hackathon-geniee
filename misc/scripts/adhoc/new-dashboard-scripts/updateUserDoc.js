const { promiseForeach } = require('node-utils');

const { ADPUSHUP_DFP_INFO } = require('../../../../configs/config');
const { fetchAllSites, updateDoc, getDoc, errorHandler } = require('./helpers');

function siteProcessing(site) {
	let siteDoc;
	return getDoc(`site::${site.siteId}`)
		.then(result => {
			siteDoc = result.value;
			return getDoc(`user::${siteDoc.ownerEmail}`);
		})
		.then(docWithCas => {
			const userCas = docWithCas.cas;
			const userDoc = docWithCas.value;

			if (userDoc.adServerSettings && userDoc.adServerSettings.dfp) {
				return true;
			}

			const { apConfigs } = siteDoc;
			userDoc.adServerSettings = {
				dfp: {
					isThirdPartyAdx: apConfigs.isThirdPartyAdx || ADPUSHUP_DFP_INFO.isThirdPartyAdx,
					activeDFPNetwork: apConfigs.activeDFPNetwork || ADPUSHUP_DFP_INFO.activeDFPNetwork,
					activeDFPParentId: apConfigs.activeDFPParentId || ADPUSHUP_DFP_INFO.activeDFPParentId,
					activeDFPCurrencyCode:
						apConfigs.activeDFPCurrencyCode || ADPUSHUP_DFP_INFO.activeDFPCurrencyCode,
					prebidGranularityMultiplier:
						apConfigs.prebidGranularityMultiplier || ADPUSHUP_DFP_INFO.prebidGranularityMultiplier,
					activeDFPCurrencyExchangeRate:
						apConfigs.activeDFPCurrencyExchangeRate ||
						ADPUSHUP_DFP_INFO.activeDFPCurrencyExchangeRate
				}
			};
			return updateDoc(`user::${siteDoc.ownerEmail}`, userDoc, userCas);
		})
		.then(() => console.log('Doc updated'));
}

function processing(sites) {
	if (!sites || !sites.length) {
		throw new Error('No Sites available');
	}
	return promiseForeach(sites, siteProcessing, errorHandler);
}

function init() {
	return fetchAllSites()
		.then(processing)
		.catch(err => console.log('Error occured : ', err));
}

// init()
// 	.then(() => console.log('Processing over'))
// 	.then(() => process.exit(0));
