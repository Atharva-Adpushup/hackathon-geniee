import axiosInstance from '../helpers/axiosInstance';

export default {
	verifyApCode: site => axiosInstance.get('/proxy/detectAp', { params: { url: site } }),
	verifyAdsTxtCode: site => axiosInstance.get('/proxy/verifyAdsTxt', { params: { url: site } })
};
