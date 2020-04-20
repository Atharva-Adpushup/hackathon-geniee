import axiosInstance from '../helpers/axiosInstance';

export default {
	verifyApCode: (site, siteId) =>
		axiosInstance.get('/proxy/detectAp', { params: { url: site, siteId } }),
	verifyAdsTxtCode: (site, siteId) =>
		axiosInstance.get('/proxy/verifyAdsTxt', { params: { url: site, siteId } }),
	getAdsTxt: () => axiosInstance.get('/proxy/getAdsTxt'),
	getMandatoryAdsTxtEntry: ({ email, siteId }) =>
		axiosInstance.get('/proxy/getMandatoryAdsTxtEntry', { params: { email, siteId } })
};
