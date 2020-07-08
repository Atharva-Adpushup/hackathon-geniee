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

export function addBidder(siteId, bidderConfig, params) {
	return axiosInstance.post(`/headerBidding/bidder/${siteId}`, { bidderConfig, params });
}

export function updateBidder(siteId, bidderConfig, params) {
	return axiosInstance.put(`/headerBidding/bidder/${siteId}`, { bidderConfig, params });
}

export function removeBidder(siteId, bidderKey) {
	return axiosInstance.delete(`/headerBidding/bidder/${siteId}`, { data: { bidderKey } });
}

export function fetchInventories(siteId) {
	return axiosInstance.get(`/headerBidding/inventory/${siteId}`);
}

export function updateInventoriesHbStatus(siteId, inventoriesToUpdate) {
	const payload = inventoriesToUpdate.map(inventory => {
		const { app, pageGroup, device, adUnit, adUnitId, headerBidding } = inventory;

		return {
			target: { app, pageGroup, device, adUnit, adUnitId },
			enableHB: headerBidding === 'Enabled'
		};
	});

	return axiosInstance.put(`/headerBidding/updateHbStatus/${siteId}`, payload);
}

export function fetchPrebidSettings(siteId) {
	return axiosInstance
		.get(`/headerBidding/prebidSettings/${siteId}`)
		.then(({ data: prebidSettings }) => prebidSettings);
}

export function updatePrebidSettings(siteId, newPrebidSettings) {
	return axiosInstance.put(`/headerBidding/prebidSettings/${siteId}`, newPrebidSettings);
}

export function fetchAmazonUAMSettings(siteId) {
	return axiosInstance
		.get(`/headerBidding/amazonUAMSettings/${siteId}`)
		.then(({ data: amazonUAMSettings }) => amazonUAMSettings);
}

export function updateAmazonUAMSettings(siteId, amazonUAMSettings) {
	return axiosInstance.put(`/headerBidding/amazonUAMSettings/${siteId}`, amazonUAMSettings);
}

export function getHbStatusForSite(siteId) {
	return axiosInstance.get(`/headerBidding/hbStatusForSite/${siteId}`).then(({ data }) => data);
}

export function toggleHbStatusForSite(siteId) {
	return axiosInstance
		.put(`/headerBidding/toggleHbStatusForSite/${siteId}`)
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

export function updateFormat(inventories, siteId) {
	// const { siteId, adUnitId, app, pageGroup, device, checked, format } = params;
	return axiosInstance.put(`/headerBidding/updateFormat/${siteId}`, {
		inventories
	});
}
export function fetchHbRules(siteId) {
	return axiosInstance.get(`/headerBidding/rules/${siteId}`);
}

export function saveHbRule(siteId, data) {
	return axiosInstance.post(`/headerBidding/rules/${siteId}`, data);
}
export function updateHbRule(siteId, data) {
	return axiosInstance.put(`/headerBidding/rules/${siteId}`, data);
}
