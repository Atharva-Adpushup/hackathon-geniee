import axiosInstance from '../../../helpers/axiosInstance';

const MGDEALS_ACTION = {
	getMGDeals: () => axiosInstance.get('/payment/getMGDeals'),
	setMGDeals: (mgDeals, type) => axiosInstance.post('/payment/setMGDeals', { mgDeals, type })
};

export default MGDEALS_ACTION;
