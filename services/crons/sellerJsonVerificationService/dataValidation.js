const couchbaseService = require('../../../helpers/couchBaseService');

// This function would return true if sellerId is present in passed siteid's ads.txt pubId
async function verifyAdsTxt(sellerId, siteId) {
	// fetch adtx::<siteid> from couchbase and check if adpushup's entry has pubid equal to sellerid ,SELECT siteId, adsTx FROM `AppBucket` WHERE meta().id like 'adtx::%' AND siteId IN [44600]
	try {
		const adtxData = await couchbaseService.getDoc('AppBucket', 'adtx::' + siteId);
		const cleanedDomain = adtxData?.value?.domain?.replace(/^(https?:\/\/)?(www\.)?/i, '') || '';
		// Check if adtxData.value.adsTxt is defined before using filter
		const verifiedSellerJson =
			adtxData?.value?.adsTxt?.filter(
				item => item.pubId === sellerId && item.domain === 'adpushup.com'
			) || [];
		const result = {
			domain: cleanedDomain,
			sellerIdMatched: !!verifiedSellerJson.length
		};
		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

//This function would return true if sellerId is present in sellers.json otherwise false
async function verifySellerJson(sellerId, data = {}) {
	try {
		const filteredSellerId = data.sellers?.filter(item => item.seller_id === sellerId) ?? [];
		return !!filteredSellerId.length;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

//This function will use to fetch the company name, email, network code and child seller id for all Google Ad Manager publishers
function verifyGamSellerId(allCompaniesList = [], childPublisherId, sellerId) {
	try {
		const filteredCompanies = allCompaniesList.filter(
			item => item.childPublisher?.childNetworkCode === childPublisherId
		);
		if (!filteredCompanies.length) {
			return false;
		}
		const [company] = filteredCompanies;
		return company?.childPublisher?.sellerId === sellerId ?? false;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

module.exports = { verifyAdsTxt, verifySellerJson, verifyGamSellerId };