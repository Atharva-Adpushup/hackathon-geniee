import axiosInstance from '../../../helpers/axiosInstance';

const MGDEALS_ACTION = {
	getMGDeals: () => axiosInstance.get('/payment/getMGDeals'),
	setMGDeals: (mgDeals, type, newDeal) => axiosInstance.post('/payment/setMGDeals', { mgDeals, type, newDeal })
};

export default MGDEALS_ACTION;
