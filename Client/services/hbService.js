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
