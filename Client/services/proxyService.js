import axiosInstance from '../helpers/axiosInstance';

export default {
	verifyApCode: site => axiosInstance.get('/proxy/detectAp', { params: { url: site } })
};
