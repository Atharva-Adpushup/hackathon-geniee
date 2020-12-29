import axiosInstance from '../helpers/axiosInstance';

export function checkInventory(siteId) {
	return axiosInstance.get(`/headerBidding/isInventoryExist/${siteId}`);
}

export function fetchBiddersList(siteId) {
	return axiosInstance.get(`/headerBidding/getBiddersList/${siteId}`);
}

export function getHBInitData(siteId) {
	return axiosInstance.get(`/headerBidding/hbInitData/${siteId}`);
}

export function addBidder(siteId, bidderConfig, params, dataForAuditLogs) {
	return axiosInstance.post(`/headerBidding/bidder/${siteId}`, {
		bidderConfig,
		params,
		dataForAuditLogs
	});
}

export function updateBidder(siteId, bidderConfig, params, dataForAuditLogs) {
	return axiosInstance.put(`/headerBidding/bidder/${siteId}`, {
		bidderConfig,
		params,
		dataForAuditLogs
	});
}

export function removeBidder(siteId, bidderKey, dataForAuditLogs) {
	return axiosInstance.delete(`/headerBidding/bidder/${siteId}`, {
		data: { bidderKey, dataForAuditLogs }
	});
}

export function fetchInventories(siteId) {
	return axiosInstance.get(`/headerBidding/inventory/${siteId}`);
}

export function updateInventoriesHbStatus(siteId, inventoriesToUpdate, dataForAuditLogs) {
	const payload = inventoriesToUpdate.map(inventory => {
		const { app, pageGroup, device, adUnit, adUnitId, headerBidding } = inventory;

		return {
			target: { app, pageGroup, device, adUnit, adUnitId },
			enableHB: headerBidding === 'Enabled'
		};
	});

	return axiosInstance.put(`/headerBidding/updateHbStatus/${siteId}`, {
		payload,
		dataForAuditLogs
	});
}

export function fetchPrebidSettings(siteId) {
	return axiosInstance
		.get(`/headerBidding/prebidSettings/${siteId}`)
		.then(({ data: prebidSettings }) => prebidSettings);
}

export function updatePrebidSettings(siteId, newPrebidConfig, dataForAuditLogs) {
	return axiosInstance.put(`/headerBidding/prebidSettings/${siteId}`, {
		newPrebidConfig,
		dataForAuditLogs
	});
}

export function fetchAmazonUAMSettings(siteId) {
	return axiosInstance
		.get(`/headerBidding/amazonUAMSettings/${siteId}`)
		.then(({ data: amazonUAMSettings }) => amazonUAMSettings);
}

export function updateAmazonUAMSettings(siteId, amazonUAMSettings, dataForAuditLogs) {
	return axiosInstance.put(`/headerBidding/amazonUAMSettings/${siteId}`, {
		amazonUAMConfig: amazonUAMSettings,
		dataForAuditLogs
	});
}

export function getHbStatusForSite(siteId) {
	return axiosInstance.get(`/headerBidding/hbStatusForSite/${siteId}`).then(({ data }) => data);
}

export function toggleHbStatusForSite(siteId, dataForAuditLogs) {
	return axiosInstance
		.put(`/headerBidding/toggleHbStatusForSite/${siteId}`, { dataForAuditLogs })
		.then(({ data }) => data);
}

export function fetchOptimizationTabInitData(siteId) {
	return axiosInstance
		.get(`/headerBidding/optimizationTabInitData/${siteId}`)
		.then(({ data }) => data);
}

export function saveBidderRule(siteId, rule) {
	return axiosInstance.post(`/headerBidding/bidderRule/${siteId}`, rule).then(({ data }) => data);
}

export function deleteBidderRule(siteId, bidder) {
	return axiosInstance
		.delete(`/headerBidding/bidderRule/${siteId}`, { data: { bidder } })
		.then(({ data }) => data);
}

export function checkOrBeginDfpSetup() {
	return axiosInstance.get(`/headerBidding/adserverSetup`);
}

export function startCdnSync(siteId) {
	return axiosInstance.get(`/headerBidding/startCdnSync/${siteId}`);
}

export function updateFormat(inventories, siteId, dataForAuditLogs) {
	// const { siteId, adUnitId, app, pageGroup, device, checked, format } = params;
	return axiosInstance.put(`/headerBidding/updateFormat/${siteId}`, {
		inventories,
		dataForAuditLogs
	});
}
export function fetchHbRules(siteId, dataForAuditLogs) {
	return axiosInstance.get(`/headerBidding/rules/${siteId}`, {
		dataForAuditLogs
	});
}

export function saveHbRule(siteId, hbRule, dataForAuditLogs) {
	return axiosInstance.post(`/headerBidding/rules/${siteId}`, {
		hbRule,
		dataForAuditLogs
	});
}
export function updateHbRule(siteId, hbRuleData, dataForAuditLogs) {
	return axiosInstance.put(`/headerBidding/rules/${siteId}`, {
		hbRuleData,
		dataForAuditLogs
	});
}
