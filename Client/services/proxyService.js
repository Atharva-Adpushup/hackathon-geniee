import axiosInstance from '../helpers/axiosInstance';

export default {
	verifyApCode: (site, siteId) =>
		axiosInstance.get('/proxy/detectAp', { params: { url: site, siteId } }),
	verifyAdsTxtCode: site => axiosInstance.get('/proxy/verifyAdsTxt', { params: { url: site } }),
	getAdsTxt: () => axiosInstance.get('/proxy/getAdsTxt')
};
