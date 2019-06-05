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
			const inventoryCopy = { ...inventory };

			inventoryCopy.tempId = uniqueKey;

			return inventoryCopy;
		});

		return { data: inventories };
	});
}
