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

export function nativeChange(params) {
	const { siteId, adUnitId, app, pageGroup, device, checked } = params;
	return axiosInstance.put(`/headerBidding/nativeChnage/${siteId}`, {
		checked,
		adUnitId,
		app,
		pageGroup,
		device
	});
}

export function videoChange(params) {
	const { siteId, adUnitId, app, pageGroup, device, checked } = params;
	return axiosInstance.put(`/headerBidding/videoChnage/${siteId}`, {
		checked,
		adUnitId,
		app,
		pageGroup,
		device
	});
}

export function allSelected(params) {
	const { siteId, app, pageGroup, device } = params;
	return axiosInstance.put(`/headerBidding/allSelected/${siteId}`, {
		pageGroup,
		device,
		app
	});
}
