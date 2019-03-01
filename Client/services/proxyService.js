import axiosInstance from '../helpers/axiosInstance';

export default {
	getAdsTxt: () => axiosInstance.get('/proxy/getAdsTxt')
};
