import axiosInstance from '../helpers/axiosInstance';

export function checkInventory(siteId) {
	return axiosInstance.get(`/headerBidding/isInventoryExist/${siteId}`);
}

export function fetchBiddersList(siteId) {
	return axiosInstance.get(`/headerBidding/getBiddersList/${siteId}`);
}

export function getSetupStatus(siteId) {
	return axiosInstance.get(`/headerBidding/setupStatus/${siteId}`);
}

export function addBidder(siteId, bidderConfig, params) {
	return axiosInstance.post(`/headerBidding/bidder/${siteId}`, { bidderConfig, params });
}

export function updateBidder(siteId, bidderConfig, params) {
	return axiosInstance.put(`/headerBidding/bidder/${siteId}`, { bidderConfig, params });
}

export function fetchInventorySizes(siteId) {
	return axiosInstance.get(`/headerBidding/getInventorySizes/${siteId}`);
}

export function fetchInventories(siteId) {
	return axiosInstance.get(`/headerBidding/inventory/${siteId}`).then(({ data: inventories }) => {
		inventories.map(inventory => {
			const { app, adUnit, device, pageGroup } = inventory;
			const uniqueKey = window.btoa(app + adUnit + device + pageGroup);

			// eslint-disable-next-line no-param-reassign
			inventory.tempId = uniqueKey;

			return inventory;
		});

		return { data: inventories };
	});
}

export function updateInventoriesHbStatus(siteId, inventoriesToUpdate) {
	const payload = inventoriesToUpdate.map(inventory => {
		const { app, pageGroup, device, adUnit, headerBidding } = inventory;

		return { target: { app, pageGroup, device, adUnit }, enableHB: headerBidding === 'Enabled' };
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

export function checkOrBeginDfpSetup(siteId) {
	return axiosInstance.get(`/headerBidding/adserverSetup/${siteId}`).then(({ data }) => data);
}
